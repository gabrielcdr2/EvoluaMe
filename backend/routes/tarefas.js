
const express = require('express');
const mongoose = require('mongoose');

const Tarefa = require('../models/Tarefa');
const Jornada = require('../models/Jornada');
const Usuario = require('../models/Usuario');
const FeedbackEvo = require('../models/FeedbackEvo');

const { autenticar } = require('../middleware/auth');
const { validarEGerarFeedback } = require('../services/gemini');
const { notificarAmigosConclusao } = require('../services/notificarAmigos');

const router = express.Router();

function idValido(id) {
  return typeof id === 'string' &&
    /^[0-9a-fA-F]{24}$/.test(id);
}

async function buscarTarefaAutorizada(tarefaId, usuarioId) {
  if (!idValido(tarefaId)) return null;

  const tarefa = await Tarefa.findById(tarefaId);
  if (!tarefa) return null;

  const jornada = await Jornada.findOne({
    _id: tarefa.jornadaId,
    usuarioId,
  });

  if (!jornada) return null;

  return { tarefa, jornada };
}

// GET /api/tarefas?jornadaId=xxx
router.get('/', autenticar, async (req, res) => {
  try {
    const { jornadaId } = req.query;

    if (!idValido(jornadaId)) {
      return res.status(400).json({
        erro: 'jornadaId válido é obrigatório.',
      });
    }

    const jornada = await Jornada.findOne({
      _id: jornadaId,
      usuarioId: req.usuario._id,
    });

    if (!jornada) {
      return res.status(404).json({
        erro: 'Jornada não encontrada.',
      });
    }

    const tarefas = await Tarefa.find({ jornadaId })
      .sort({ createdAt: 1 });

    return res.json(tarefas);
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro ao buscar tarefas.',
    });
  }
});

// GET /api/tarefas/:id
router.get('/:id', autenticar, async (req, res) => {
  try {
    const resultado = await buscarTarefaAutorizada(
      req.params.id,
      req.usuario._id
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    return res.json(resultado.tarefa);
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro ao buscar tarefa.',
    });
  }
});

// POST /api/tarefas
router.post('/', autenticar, async (req, res) => {
  try {
    const {
      jornadaId,
      titulo,
      descricao,
      xpRecompensa,
      requerAnexo,
    } = req.body;

    if (!idValido(jornadaId) ||
        typeof titulo !== 'string' ||
        !titulo.trim()) {
      return res.status(400).json({
        erro: 'jornadaId e título válidos são obrigatórios.',
      });
    }

    const jornada = await Jornada.findOne({
      _id: jornadaId,
      usuarioId: req.usuario._id,
    });

    if (!jornada) {
      return res.status(404).json({
        erro: 'Jornada não encontrada.',
      });
    }

    const tarefa = await Tarefa.create({
      jornadaId,
      titulo,
      descricao,
      xpRecompensa,
      requerAnexo: Boolean(requerAnexo),
    });

    return res.status(201).json(tarefa);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        erro: err.message,
      });
    }

    return res.status(500).json({
      erro: 'Erro ao criar tarefa.',
    });
  }
});

// PATCH /api/tarefas/:id/status
router.patch('/:id/status', autenticar, async (req, res) => {
  try {
    const resultado = await buscarTarefaAutorizada(
      req.params.id,
      req.usuario._id
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    const { status, urlComprovante } = req.body;

    if (!['Pendente', 'Aguardando Validação'].includes(status)) {
      return res.status(400).json({
        erro: 'Status inválido. Use a rota de conclusão para concluir tarefas.',
      });
    }

    const update = { status };

    if (urlComprovante !== undefined) {
      update.urlComprovante = urlComprovante;
    }

    const tarefa = await Tarefa.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $ne: 'Concluída' },
      },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!tarefa) {
      return res.status(409).json({
        erro: 'Tarefa já concluída ou indisponível.',
      });
    }

    return res.json(tarefa);
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro ao atualizar tarefa.',
    });
  }
});

// GET /api/tarefas/:id/feedbacks
router.get('/:id/feedbacks', autenticar, async (req, res) => {
  try {
    const resultado = await buscarTarefaAutorizada(
      req.params.id,
      req.usuario._id
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    const feedbacks = await FeedbackEvo.find({
      tarefaId: req.params.id,
      usuarioId: req.usuario.id,
    }).sort({ createdAt: -1 });

    return res.json(feedbacks);
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro ao buscar histórico de feedbacks.',
    });
  }
});

// PATCH /api/tarefas/:id/concluir
router.patch('/:id/concluir', autenticar, async (req, res) => {
  try {
    const { descricaoUsuario, base64Imagem } = req.body;

    const resultado = await buscarTarefaAutorizada(
      req.params.id,
      req.usuario._id
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    const { tarefa, jornada } = resultado;

    if (tarefa.status === 'Concluída') {
      return res.status(409).json({
        erro: 'Tarefa já foi concluída.',
      });
    }

    let xpExtraConcedido = 0;

    // Validação com o Evo, antes da transação.
    if (tarefa.requerAnexo) {
      if (typeof descricaoUsuario !== 'string' ||
          !descricaoUsuario.trim()) {
        return res.status(400).json({
          erro: 'Esta tarefa exige uma descrição do que foi feito para o Evo analisar.',
        });
      }

      let resultadoEvo;

      try {
        resultadoEvo = await validarEGerarFeedback(
          jornada.titulo,
          tarefa.titulo,
          tarefa.descricao,
          descricaoUsuario,
          base64Imagem
        );
      } catch (evoError) {
        console.error(
          'Falha ao comunicar com Evo:',
          evoError.message
        );

        resultadoEvo = {
          aprovado: false,
          mensagem_mentor:
            'Infelizmente meu sistema falhou ou eu não consegui compreender sua imagem agora. Pode tentar de novo?',
          motivo_reprovacao:
            'Falha de conexão com a API de IA ou sobrecarga nos servidores.',
          sugestao_xp_extra: 0,
        };
      }

      const xpSugerido = Number(
        resultadoEvo.sugestao_xp_extra ??
        resultadoEvo.sugestaoXpExtra ??
        0
      );

      // O feedback continua sendo salvo mesmo
      // quando o Evo reprova a submissão.
      const feedback = await FeedbackEvo.create({
        tarefaId: tarefa._id,
        usuarioId: req.usuario.id,
        descricaoEnviada: descricaoUsuario,
        urlImagem: base64Imagem ? '(Base64 Imagem)' : null,
        aprovado: Boolean(resultadoEvo.aprovado),
        mensagemMentor:
          resultadoEvo.mensagem_mentor ||
          resultadoEvo.mensagemMentor ||
          'O Evo não deixou um comentário.',
        motivoReprovacao:
          resultadoEvo.motivo_reprovacao ||
          resultadoEvo.motivoReprovacao ||
          (resultadoEvo.aprovado
            ? ''
            : 'Motivo não especificado.'),
        xpExtra: Number.isFinite(xpSugerido)
          ? xpSugerido
          : 0,
      });

      if (!resultadoEvo.aprovado) {
        return res.status(400).json({
          erro: 'O Evo não aprovou sua submissão.',
          feedback,
        });
      }

      xpExtraConcedido = Number.isFinite(xpSugerido)
        ? xpSugerido
        : 0;
    }

    const xpBase = tarefa.xpRecompensa || 50;
    const xpGanho = xpBase + xpExtraConcedido;

    let respostaConclusao = null;
    let tarefaConcluida = null;
    let usuarioAtualizado = null;

    // A conclusão e o XP são confirmados juntos.
    // O MongoDB precisa suportar transações.
    await mongoose.connection.transaction(async (session) => {
      // Revalida a propriedade dentro da transação.
      const jornadaAutorizada = await Jornada.findOne({
        _id: jornada._id,
        usuarioId: req.usuario._id,
      }).session(session);

      if (!jornadaAutorizada) {
        const erro = new Error('Jornada não encontrada.');
        erro.status = 404;
        throw erro;
      }

      // A condição de status evita conclusão duplicada.
      tarefaConcluida = await Tarefa.findOneAndUpdate(
        {
          _id: tarefa._id,
          jornadaId: jornadaAutorizada._id,
          status: { $ne: 'Concluída' },
        },
        {
          $set: {
            status: 'Concluída',
            dataConclusao: new Date(),
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!tarefaConcluida) {
        const erro = new Error('Esta tarefa já foi concluída.');
        erro.status = 409;
        throw erro;
      }

      usuarioAtualizado = await Usuario.findByIdAndUpdate(
        req.usuario._id,
        { $inc: { xpTotal: xpGanho } },
        { new: true, session }
      );

      if (!usuarioAtualizado) {
        throw new Error('Usuário não encontrado ao atualizar XP.');
      }

      // Preserva a regra atual: no máximo um
      // aumento de nível por conclusão.
      const xpParaProxNivel =
        usuarioAtualizado.nivelGlobal * 100;

      let subiuDeNivel = false;

      if (usuarioAtualizado.xpTotal >= xpParaProxNivel) {
        usuarioAtualizado = await Usuario.findByIdAndUpdate(
          req.usuario._id,
          { $inc: { nivelGlobal: 1 } },
          { new: true, session }
        );

        subiuDeNivel = true;
      }

      const feedbacksAtualizados = await FeedbackEvo.find({
        tarefaId: tarefa._id,
      })
        .sort({ createdAt: -1 })
        .session(session);

      respostaConclusao = {
        tarefa: tarefaConcluida,
        xpGanho,
        xpBase,
        xpExtra: xpExtraConcedido,
        subiuDeNivel,
        novoNivel: usuarioAtualizado.nivelGlobal,
        novoXpTotal: usuarioAtualizado.xpTotal,
        feedbacks: feedbacksAtualizados,
        mensagem: subiuDeNivel
          ? `⭐ Level Up! Você chegou ao nível ${usuarioAtualizado.nivelGlobal}! (+${xpGanho} XP)`
          : `🎉 Tarefa concluída! +${xpGanho} XP`,
      };
    });

    // Só chegamos aqui depois do commit da transação.
    res.json(respostaConclusao);

    // Uma falha no Expo não desfaz a conclusão.
    void notificarAmigosConclusao(
      usuarioAtualizado,
      tarefaConcluida
    ).catch((erro) => {
      console.error('Falha ao notificar amigos:', erro);
    });
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);

    if (!res.headersSent) {
      return res.status(err.status || 500).json({
        erro: err.status
          ? err.message
          : 'Erro ao concluir tarefa.',
      });
    }
  }
});

// DELETE /api/tarefas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const resultado = await buscarTarefaAutorizada(
      req.params.id,
      req.usuario._id
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    const tarefa = await Tarefa.findByIdAndDelete(
      req.params.id
    );

    if (!tarefa) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.',
      });
    }

    return res.json({
      mensagem: 'Tarefa removida com sucesso.',
    });
  } catch (err) {
    return res.status(500).json({
      erro: 'Erro ao remover tarefa.',
    });
  }
});

module.exports = router;
