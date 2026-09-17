const mongoose = require('mongoose');

const ProgressoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    nivel: {
      type: Number,
      default: 1,
    },
    totalDesafiosConcluidos: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progresso', ProgressoSchema);
