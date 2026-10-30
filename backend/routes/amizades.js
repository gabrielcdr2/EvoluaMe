
const express = require('express');
const router = express.Router();

const Usuario = require('../models/Usuario');
const Amizade = require('../models/Amizade');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

// Pesquisar usuário pelo e-mail
// GET /api/amizades/buscar?email=exemplo@email.com
router.get('/buscar', async (req, res) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ erro: 'Informe um e-mail.' });
    }

    const usuario = await Usuario.findOne({
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    }).select('nome email');

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    if (usuario._id.equals(req.usuario._id)) {
      return res.status(400).json({ erro: 'Você não pode adicionar a si mesmo.' });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao pesquisar usuário.' });
  }
});

// Enviar solicitação de amizade
// POST /api/amizades/solicitar
router.post('/solicitar', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ erro: 'Informe o e-mail do amigo.' });
    }

    const destinatario = await Usuario.findOne({
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (!destinatario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    if (destinatario._id.equals(req.usuario._id)) {
      return res.status(400).json({ erro: 'Você não pode adicionar a si mesmo.' });
    }

    const existente = await Amizade.findOne({
      $or: [
        { solicitante: req.usuario._id, destinatario: destinatario._id },
        { solicitante: destinatario._id, destinatario: req.usuario._id },
      ],
    });

    if (existente) {
      return res.status(409).json({
        erro: 'Já existe uma amizade ou solicitação entre vocês.',
      });
    }

    const amizade = await Amizade.create({
      solicitante: req.usuario._id,
      destinatario: destinatario._id,
    });

    res.status(201).json({
      mensagem: 'Solicitação enviada!',
      amizade,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Solicitação já existente.' });
    }
    res.status(500).json({ erro: 'Erro ao enviar solicitação.' });
  }
});

// Listar solicitações recebidas
// GET /api/amizades/solicitacoes
router.get('/solicitacoes', async (req, res) => {
  try {
    const solicitacoes = await Amizade.find({
      destinatario: req.usuario._id,
      status: 'pendente',
    })
      .populate('solicitante', 'nome email')
      .sort({ createdAt: -1 });

    res.json(solicitacoes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar solicitações.' });
  }
});

// Aceitar solicitação
// PATCH /api/amizades/:id/aceitar
router.patch('/:id/aceitar', async (req, res) => {
  try {
    const amizade = await Amizade.findOneAndUpdate(
      {
        _id: req.params.id,
        destinatario: req.usuario._id,
        status: 'pendente',
      },
      { status: 'aceita' },
      { new: true }
    );

    if (!amizade) {
      return res.status(404).json({ erro: 'Solicitação pendente não encontrada.' });
    }

    res.json({ mensagem: 'Amizade aceita!', amizade });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao aceitar solicitação.' });
  }
});

// Recusar solicitação
// PATCH /api/amizades/:id/recusar
router.patch('/:id/recusar', async (req, res) => {
  try {
    const amizade = await Amizade.findOneAndUpdate(
      {
        _id: req.params.id,
        destinatario: req.usuario._id,
        status: 'pendente',
      },
      { status: 'recusada' },
      { new: true }
    );

    if (!amizade) {
      return res.status(404).json({ erro: 'Solicitação pendente não encontrada.' });
    }

    res.json({ mensagem: 'Solicitação recusada.', amizade });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao recusar solicitação.' });
  }
});

// Listar amigos
// GET /api/amizades
router.get('/', async (req, res) => {
  try {
    const amizades = await Amizade.find({
      status: 'aceita',
      $or: [
        { solicitante: req.usuario._id },
        { destinatario: req.usuario._id },
      ],
    })
      .populate('solicitante', 'nome email')
      .populate('destinatario', 'nome email');

    const amigos = amizades.map((amizade) => {
      const souSolicitante = amizade.solicitante._id.equals(req.usuario._id);
      return {
        amizadeId: amizade._id,
        usuario: souSolicitante ? amizade.destinatario : amizade.solicitante,
      };
    });

    res.json(amigos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar amigos.' });
  }
});

module.exports = router;
