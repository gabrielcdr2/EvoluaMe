const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');
const Jornada = require('../models/Jornada');
const Usuario = require('../models/Usuario');
const FeedbackEvo = require('../models/FeedbackEvo');
const { autenticar } = require('../middleware/auth');
const { validarEGerarFeedback } = require('../services/gemini');

// GET /api/tarefas?jornadaId=xxx
router.get('/', autenticar, async (req, res) => {
  try {
    const { jornadaId } = req.query;
    if (!jornadaId) return res.status(400).json({ erro: 'jornadaId é obrigatório.' });

    // Garante que a jornada pertence ao usuário
    const jornada = await Jornada.findOne({ _id: jornadaId, usuarioId: req.usuario._id });
    if (!jornada) return res.status(404).json({ erro: 'Jornada não encontrada.' });

    const tarefas = await Tarefa.find({ jornadaId }).sort({ createdAt: 1 });
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.' });
  }
});

// GET /api/tarefas/:id
router.get('/:id', autenticar, async (req, res) => {
  try {
    const tarefa = await Tarefa.findById(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tarefa.' });
  }
});

// POST /api/tarefas
router.post('/', autenticar, async (req, res) => {
  try {
    const { jornadaId, titulo, descricao, xpRecompensa, requerAnexo } = req.body;

    if (!jornadaId || !titulo) {
      return res.status(400).json({ erro: 'jornadaId e título são obrigatórios.' });
    }

    // Garante que a jornada pertence ao usuário
    const jornada = await Jornada.findOne({ _id: jornadaId, usuarioId: req.usuario._id });
    if (!jornada) return res.status(404).json({ erro: 'Jornada não encontrada.' });

    const tarefa = await Tarefa.create({ 
      jornadaId, 
      titulo, 
      descricao, 
      xpRecompensa,
      requerAnexo: Boolean(requerAnexo)
    });
    res.status(201).json(tarefa);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ erro: err.message });
    }
    res.status(500).json({ erro: 'Erro ao criar tarefa.' });
  }
});

// PATCH /api/tarefas/:id/status
router.patch('/:id/status', autenticar, async (req, res) => {
  try {
    const { status, urlComprovante } = req.body;

    const update = { status };
    if (status === 'Concluída') update.dataConclusao = new Date();
    if (urlComprovante) update.urlComprovante = urlComprovante;

    const tarefa = await Tarefa.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar tarefa.' });
  }
});

// GET /api/tarefas/:id/feedbacks
// Busca o histórico de feedbacks do Evo para uma tarefa
router.get('/:id/feedbacks', autenticar, async (req, res) => {
  try {
    const feedbacks = await FeedbackEvo.find({ 
      tarefaId: req.params.id,
      usuarioId: req.usuario.id
    }).sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico de feedbacks.' });
  }
});

// PATCH /api/tarefas/:id/concluir
// Conclui a tarefa e adiciona XP ao usuário (com validação de IA opcional)
router.patch('/:id/concluir', autenticar, async (req, res) => {
  try {
    const { descricaoUsuario, base64Imagem } = req.body;
    
    const tarefa = await Tarefa.findById(req.params.id).populate('jornadaId');
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });

    if (tarefa.status === 'Concluída') {
      return res.status(400).json({ erro: 'Tarefa já foi concluída.' });
    }

    const usuario = req.usuario;
    let xpExtraConcedido = 0;

    // --- Lógica de Validação com IA ---
    if (tarefa.requerAnexo) {
      if (!descricaoUsuario) {
        return res.status(400).json({ erro: 'Esta tarefa exige uma descrição do que foi feito para o Evo analisar.' });
      }

      // Chama o Evo (Gemini)
      const resultadoEvo = await validarEGerarFeedback(
        tarefa.jornadaId.titulo,
        tarefa.titulo,
        tarefa.descricao,
        descricaoUsuario,
        base64Imagem
      );

      // Salva o feedback
      const feedback = await FeedbackEvo.create({
        tarefaId: tarefa._id,
        usuarioId: usuario.id,
        descricaoEnviada: descricaoUsuario,
        urlImagem: base64Imagem ? '(Base64 Imagem)' : null, // Evitando salvar base64 gigante no banco por performance neste protótipo, ou você poderia salvar num S3
        aprovado: Boolean(resultadoEvo.aprovado),
        mensagemMentor: resultadoEvo.mensagem_mentor || resultadoEvo.mensagemMentor || 'O Evo não deixou um comentário.',
        motivoReprovacao: resultadoEvo.motivo_reprovacao || resultadoEvo.motivoReprovacao || (resultadoEvo.aprovado ? '' : 'Motivo não especificado.'),
        xpExtra: Number(resultadoEvo.sugestao_xp_extra || resultadoEvo.sugestaoXpExtra) || 0,
      });

      // Se reprovado, retorna 400 mas devolve o feedback (para o app exibir)
      if (!resultadoEvo.aprovado) {
        return res.status(400).json({ 
          erro: 'O Evo não aprovou sua submissão.', 
          feedback 
        });
      }

      xpExtraConcedido = resultadoEvo.sugestao_xp_extra || 0;
    }

    // Marca a tarefa como concluída
    tarefa.status = 'Concluída';
    tarefa.dataConclusao = new Date();
    await tarefa.save();

    // Adiciona XP ao usuário
    const xpBase = tarefa.xpRecompensa || 50;
    const xpGanho = xpBase + xpExtraConcedido;
    usuario.xpTotal += xpGanho;

    // Verifica level up (a cada nivel*100 XP sobe de nível)
    const xpParaProxNivel = usuario.nivelGlobal * 100;
    let subiuDeNivel = false;
    if (usuario.xpTotal >= xpParaProxNivel) {
      usuario.nivelGlobal += 1;
      subiuDeNivel = true;
    }

    await usuario.save();
    
    // Busca os feedbacks atualizados
    const feedbacksAtualizados = await FeedbackEvo.find({ tarefaId: tarefa._id }).sort({ createdAt: -1 });

    res.json({
      tarefa,
      xpGanho,
      xpBase,
      xpExtra: xpExtraConcedido,
      subiuDeNivel,
      novoNivel: usuario.nivelGlobal,
      novoXpTotal: usuario.xpTotal,
      feedbacks: feedbacksAtualizados,
      mensagem: subiuDeNivel
        ? `⭐ Level Up! Você chegou ao nível ${usuario.nivelGlobal}! (+${xpGanho} XP)`
        : `🎉 Tarefa concluída! +${xpGanho} XP`,
    });
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
    res.status(500).json({ erro: err.message || 'Erro ao concluir tarefa.' });
  }
});

// DELETE /api/tarefas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    res.json({ mensagem: 'Tarefa removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover tarefa.' });
  }
});

module.exports = router;
