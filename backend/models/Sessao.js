
const mongoose = require('mongoose');

const SessaoSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    usuarioId: {
      type: String,
      required: true,
      index: true,
    },
    expiraEm: {
      type: Date,
      required: true,
    },
    revogadaEm: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

SessaoSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Sessao', SessaoSchema);
