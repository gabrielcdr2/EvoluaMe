const express = require('express');
const router = express.Router();
const Progresso = require('../models/Progresso');
const Atividade = require('../models/Atividade');

// GET /api/progresso/:usuarioId
// Busca o progresso (XP e nível) do usuário
router.get('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Cria o progresso zerado se for a primeira vez
    let progresso = await Progresso.findOne({ usuarioId });
    if (!progresso) {
      progresso = await Progresso.create({ usuarioId });
    }

    res.json(progresso);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar progresso.' });
  }
});

// POST /api/progresso/concluir
// Conclui uma atividade: adiciona XP, verifica level up e remove do banco
router.post('/concluir', async (req, res) => {
  try {
    const { usuarioId, atividadeId } = req.body;

    if (!usuarioId || !atividadeId) {
      return res.status(400).json({ erro: 'usuarioId e atividadeId são obrigatórios.' });
    }

    // Busca a atividade
    const atividade = await Atividade.findById(atividadeId);
    if (!atividade) {
      return res.status(404).json({ erro: 'Atividade não encontrada.' });
    }

    // Busca ou cria o progresso do usuário
    let progresso = await Progresso.findOne({ usuarioId });
    if (!progresso) {
      progresso = await Progresso.create({ usuarioId });
    }

    const xpGanho = atividade.xpRecompensa || 50;
    progresso.xp += xpGanho;
    progresso.totalDesafiosConcluidos += 1;

    // Verifica level up
    const xpNecessario = progresso.nivel * 100;
    let subiuDeNivel = false;

    if (progresso.xp >= xpNecessario) {
      progresso.xp -= xpNecessario;
      progresso.nivel += 1;
      subiuDeNivel = true;
    }

    await progresso.save();

    // Remove a atividade concluída
    await Atividade.findByIdAndDelete(atividadeId);

    res.json({
      progresso,
      xpGanho,
      subiuDeNivel,
      mensagem: subiuDeNivel
        ? `⭐ Level Up! Você chegou ao nível ${progresso.nivel}!`
        : `🎉 Desafio concluído! +${xpGanho} XP`,
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao concluir atividade.' });
  }
});

module.exports = router;
