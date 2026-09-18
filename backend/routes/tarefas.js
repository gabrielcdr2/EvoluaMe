const express = require('express');
const router = express.Router();
const Tarefa = require('../models/Tarefa');
const Jornada = require('../models/Jornada');
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
