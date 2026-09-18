const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Usuario = require('../models/Usuario');
const { autenticar } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'evoluame-secret-key';

// ─── POST /api/auth/cadastro ─────────────────────────────────
// Registra um novo usuário
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    // Verifica se email já existe
    const emailExistente = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    const usuario = await Usuario.create({
      id: uuidv4(),
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senhaHash,
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivelGlobal: usuario.nivelGlobal,
        xpTotal: usuario.xpTotal,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro no cadastro:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
// Autentica um usuário existente
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivelGlobal: usuario.nivelGlobal,
        xpTotal: usuario.xpTotal,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────
// Retorna os dados do usuário autenticado
router.get('/me', autenticar, (req, res) => {
  const u = req.usuario;
  res.json({
    id: u.id,
    nome: u.nome,
    email: u.email,
    nivelGlobal: u.nivelGlobal,
    xpTotal: u.xpTotal,
  });
});

module.exports = router;
