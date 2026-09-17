const express = require('express');
const router = express.Router();
const Atividade = require('../models/Atividade');

// GET /api/atividades?usuarioId=xxx&area=Estudos
// Busca todas as atividades de um usuário por área
router.get('/', async (req, res) => {
  try {
    const { usuarioId, area } = req.query;

    if (!usuarioId) {
      return res.status(400).json({ erro: 'usuarioId é obrigatório.' });
    }

    const filtro = { usuarioId };
    if (area) filtro.area = area;

    const atividades = await Atividade.find(filtro).sort({ createdAt: -1 });
    res.json(atividades);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar atividades.' });
  }
});

// POST /api/atividades
// Cria uma nova atividade/desafio
router.post('/', async (req, res) => {
  try {
    const { usuarioId, area, nome } = req.body;

    if (!usuarioId || !area || !nome) {
      return res.status(400).json({ erro: 'usuarioId, area e nome são obrigatórios.' });
    }

    const atividade = await Atividade.create({ usuarioId, area, nome });
    res.status(201).json(atividade);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ erro: err.message });
    }
    res.status(500).json({ erro: 'Erro ao criar atividade.' });
  }
});

// DELETE /api/atividades/:id
// Remove uma atividade
router.delete('/:id', async (req, res) => {
  try {
    const atividade = await Atividade.findByIdAndDelete(req.params.id);

    if (!atividade) {
      return res.status(404).json({ erro: 'Atividade não encontrada.' });
    }

    res.json({ mensagem: 'Atividade removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover atividade.' });
  }
});

module.exports = router;
