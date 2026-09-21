const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');
const Jornada = require('../models/Jornada');
const Usuario = require('../models/Usuario');
const { autenticar } = require('../middleware/auth');

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

// POST /api/tarefas
router.post('/', autenticar, async (req, res) => {
  try {
    const { jornadaId, titulo, descricao, xpRecompensa } = req.body;

    if (!jornadaId || !titulo) {
      return res.status(400).json({ erro: 'jornadaId e título são obrigatórios.' });
    }

    // Garante que a jornada pertence ao usuário
    const jornada = await Jornada.findOne({ _id: jornadaId, usuarioId: req.usuario._id });
    if (!jornada) return res.status(404).json({ erro: 'Jornada não encontrada.' });

    const tarefa = await Tarefa.create({ jornadaId, titulo, descricao, xpRecompensa });
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

// PATCH /api/tarefas/:id/concluir
// Conclui a tarefa e adiciona XP ao usuário
router.patch('/:id/concluir', autenticar, async (req, res) => {
  try {
    const tarefa = await Tarefa.findById(req.params.id);
    if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });

    if (tarefa.status === 'Concluída') {
      return res.status(400).json({ erro: 'Tarefa já foi concluída.' });
    }

    // Marca a tarefa como concluída
    tarefa.status = 'Concluída';
    tarefa.dataConclusao = new Date();
    await tarefa.save();

    // Adiciona XP ao usuário
    const usuario = req.usuario;
    const xpGanho = tarefa.xpRecompensa || 50;
    usuario.xpTotal += xpGanho;

    // Verifica level up (a cada nivel*100 XP sobe de nível)
    const xpParaProxNivel = usuario.nivelGlobal * 100;
    let subiuDeNivel = false;
    if (usuario.xpTotal >= xpParaProxNivel) {
      usuario.nivelGlobal += 1;
      subiuDeNivel = true;
    }

    await usuario.save();

    res.json({
      tarefa,
      xpGanho,
      subiuDeNivel,
      novoNivel: usuario.nivelGlobal,
      novoXpTotal: usuario.xpTotal,
      mensagem: subiuDeNivel
        ? `⭐ Level Up! Você chegou ao nível ${usuario.nivelGlobal}!`
        : `🎉 Tarefa concluída! +${xpGanho} XP`,
    });
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
    res.status(500).json({ erro: 'Erro ao concluir tarefa.' });
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
