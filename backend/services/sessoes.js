
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const Sessao = require('../models/Sessao');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurada no servidor.');
}

async function criarSessao(usuario) {
  const jti = randomUUID();

  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
      jwtid: jti,
    }
  );

  const payload = jwt.decode(token);

  await Sessao.create({
    jti,
    usuarioId: usuario.id,
    expiraEm: new Date(payload.exp * 1000),
  });

  return token;
}

async function verificarSessao(payload) {
  if (!payload.jti || !payload.id) {
    return false;
  }

  const sessao = await Sessao.findOne({
    jti: payload.jti,
    usuarioId: payload.id,
    revogadaEm: null,
    expiraEm: { $gt: new Date() },
  });

  return Boolean(sessao);
}

async function revogarSessao(jti, usuarioId) {
  const resultado = await Sessao.updateOne(
    {
      jti,
      usuarioId,
      revogadaEm: null,
    },
    {
      $set: { revogadaEm: new Date() },
    }
  );

  return resultado.modifiedCount > 0;
}

module.exports = {
  criarSessao,
  verificarSessao,
  revogarSessao,
};
