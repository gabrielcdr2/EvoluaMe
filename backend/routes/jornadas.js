const express = require('express');
const router = express.Router();
const Jornada = require('../models/Jornada');
const Tarefa = require('../models/Tarefa');
const { autenticar } = require('../middleware/auth');

// GET /api/jornadas
// Lista as jornadas do usuário autenticado
router.get('/', autenticar, async (req, res) => {
  try {
    const jornadas = await Jornada.find({ usuarioId: req.usuario._id }).sort({ createdAt: -1 });
    res.json(jornadas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar jornadas.' });
  }
});

// GET /api/jornadas/ativa
// Retorna a primeira jornada ativa do usuário + suas tarefas pendentes
router.get('/ativa', autenticar, async (req, res) => {
  try {
    const jornada = await Jornada.findOne({
      usuarioId: req.usuario._id,
      status: 'Ativa',
    }).sort({ createdAt: -1 });

    if (!jornada) {
      return res.json({ jornada: null, tarefas: [] });
    }

    const tarefas = await Tarefa.find({
      jornadaId: jornada._id,
      status: { $in: ['Pendente', 'Aguardando Validação'] },
    }).sort({ createdAt: 1 }).limit(5);

    res.json({ jornada, tarefas });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar jornada ativa.' });
  }
});

// POST /api/jornadas
// Cria uma nova jornada
router.post('/', autenticar, async (req, res) => {
  try {
    const { titulo, categoria } = req.body;

    if (!titulo || !categoria) {
      return res.status(400).json({ erro: 'Título e categoria são obrigatórios.' });
    }

    const jornada = await Jornada.create({
      usuarioId: req.usuario._id,
      titulo,
      categoria,
    });

    res.status(201).json(jornada);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ erro: err.message });
    }
    res.status(500).json({ erro: 'Erro ao criar jornada.' });
  }
});

// PATCH /api/jornadas/:id/status
// Atualiza o status de uma jornada
router.patch('/:id/status', autenticar, async (req, res) => {
  try {
    const { status } = req.body;
    const jornada = await Jornada.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuario._id },
      { status },
      { new: true, runValidators: true }
    );
    if (!jornada) return res.status(404).json({ erro: 'Jornada não encontrada.' });
    res.json(jornada);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar jornada.' });
  }
});

// DELETE /api/jornadas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const jornada = await Jornada.findOneAndDelete({
      _id: req.params.id,
      usuarioId: req.usuario._id,
    });
    if (!jornada) return res.status(404).json({ erro: 'Jornada não encontrada.' });
    await Tarefa.deleteMany({ jornadaId: req.params.id });
    res.json({ mensagem: 'Jornada removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover jornada.' });
  }
});

module.exports = router;
