const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'evoluame-secret-key';

/**
 * Middleware que verifica o token JWT no header Authorization.
 * Popula req.usuario com o documento do banco de dados.
 */
async function autenticar(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const usuario = await Usuario.findOne({ id: payload.id }).select('-senha');
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = { autenticar };
