
const express = require('express');
const { autenticar } = require('../middleware/auth');
const Usuario = require('../models/Usuario');
const Amizade = require('../models/Amizade');
const { supabaseAdmin } = require('../services/supabase');

const router = express.Router();

router.use(autenticar);

// Verifica se o chat está autenticado
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    mensagem: 'Chat autenticado com sucesso.',
    usuarioId: req.usuario.id,
  });
});

// Cria ou recupera uma conversa entre amigos
router.post('/conversas', async (req, res) => {
  try {
    const meuId = req.usuario.id;
    const amigoId = req.body?.amigoId;

    if (
      typeof amigoId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(amigoId)
    ) {
      return res.status(400).json({
        erro: 'Identificador do amigo inválido.',
      });
    }

    if (meuId === amigoId) {
      return res.status(400).json({
        erro: 'Você não pode iniciar uma conversa consigo mesmo.',
      });
    }

    const amigo = await Usuario.findOne({ id: amigoId });

    if (!amigo) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const amizade = await Amizade.findOne({
      status: 'aceita',
      $or: [
        {
          solicitante: req.usuario._id,
          destinatario: amigo._id,
        },
        {
          solicitante: amigo._id,
          destinatario: req.usuario._id,
        },
      ],
    });

    if (!amizade) {
      return res.status(403).json({
        erro: 'Somente amigos podem iniciar uma conversa.',
      });
    }

    const participantes = [meuId, amigoId].sort();
    const chavePar = participantes.join(':');

    const { data: conversa, error: erroConversa } =
      await supabaseAdmin
        .from('conversas')
        .upsert(
          { chave_par: chavePar },
          { onConflict: 'chave_par', ignoreDuplicates: true }
        )
        .select('id, chave_par')
        .maybeSingle();

    if (erroConversa) {
      throw erroConversa;
    }

    let conversaAtual = conversa;

    if (!conversaAtual) {
      const { data, error } = await supabaseAdmin
        .from('conversas')
        .select('id, chave_par')
        .eq('chave_par', chavePar)
        .single();

      if (error) throw error;
      conversaAtual = data;
    }

    const { error: erroParticipantes } = await supabaseAdmin
      .from('conversa_participantes')
      .upsert(
        participantes.map((usuarioId) => ({
          conversa_id: conversaAtual.id,
          usuario_id: usuarioId,
        })),
        {
          onConflict: 'conversa_id,usuario_id',
          ignoreDuplicates: true,
        }
      );

    if (erroParticipantes) {
      throw erroParticipantes;
    }

    return res.json({
      conversaId: conversaAtual.id,
      amigo: {
        id: amigo.id,
        nome: amigo.nome,
      },
    });
  } catch (erro) {
    console.error('Erro ao criar conversa:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível iniciar a conversa.',
    });
  }
});


 // Consulta o histórico de mensagens de uma conversa
router.get('/conversas/:conversaId/mensagens', async (req, res) => {
  try {
    const { conversaId } = req.params;
    const usuarioId = req.usuario.id;

    const formatoUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!formatoUUID.test(conversaId)) {
      return res.status(400).json({
        erro: 'Identificador da conversa inválido.',
      });
    }

    // Confirma que o usuário participa da conversa
    const { data: participante, error: erroParticipante } =
      await supabaseAdmin
        .from('conversa_participantes')
        .select('usuario_id')
        .eq('conversa_id', conversaId)
        .eq('usuario_id', usuarioId)
        .maybeSingle();

    if (erroParticipante) {
      throw erroParticipante;
    }

    if (!participante) {
      return res.status(403).json({
        erro: 'Você não tem permissão para visualizar esta conversa.',
      });
    }

    // Busca as mensagens em ordem cronológica
    const { data: mensagens, error: erroMensagens } =
      await supabaseAdmin
        .from('mensagens')
        .select('id, conversa_id, remetente_id, conteudo, criada_em')
        .eq('conversa_id', conversaId)
        .order('criada_em', { ascending: true })
        .order('id', { ascending: true })
        .limit(100);

    if (erroMensagens) {
      throw erroMensagens;
    }

    return res.json({
      conversaId,
      mensagens: mensagens ?? [],
    });
  } catch (erro) {
    console.error('Erro ao consultar mensagens:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível consultar as mensagens.',
    });
  }
});


module.exports = router;


 // Envia uma mensagem para uma conversa da qual o usuário participa
router.post('/conversas/:conversaId/mensagens', async (req, res) => {
  try {
    const { conversaId } = req.params;
    const remetenteId = req.usuario.id;
    const conteudo = req.body?.conteudo;

    const formatoUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!formatoUUID.test(conversaId)) {
      return res.status(400).json({
        erro: 'Identificador da conversa inválido.',
      });
    }

    if (
      typeof conteudo !== 'string' ||
      conteudo.trim().length === 0 ||
      conteudo.trim().length > 2000
    ) {
      return res.status(400).json({
        erro: 'A mensagem deve conter entre 1 e 2000 caracteres.',
      });
    }

    // Confirma que o remetente pertence à conversa
    const { data: participante, error: erroParticipante } =
      await supabaseAdmin
        .from('conversa_participantes')
        .select('usuario_id')
        .eq('conversa_id', conversaId)
        .eq('usuario_id', remetenteId)
        .maybeSingle();

    if (erroParticipante) {
      throw erroParticipante;
    }

    if (!participante) {
      return res.status(403).json({
        erro: 'Você não tem permissão para enviar mensagens nesta conversa.',
      });
    }

    // Salva a mensagem no Supabase
    const { data: mensagem, error: erroMensagem } =
      await supabaseAdmin
        .from('mensagens')
        .insert({
          conversa_id: conversaId,
          remetente_id: remetenteId,
          conteudo: conteudo.trim(),
        })
        .select('id, conversa_id, remetente_id, conteudo, criada_em')
        .single();

    if (erroMensagem) {
      throw erroMensagem;
    }

    return res.status(201).json({
      mensagem,
    });
  } catch (erro) {
    console.error('Erro ao enviar mensagem:', erro.message);

    return res.status(500).json({
      erro: 'Não foi possível enviar a mensagem.',
    });
  }
});

