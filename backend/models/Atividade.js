const mongoose = require('mongoose');

const AtividadeSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      enum: ['Estudos', 'Atividade Física', 'Leitura', 'Línguas Estrangeiras'],
    },
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    concluida: {
      type: Boolean,
      default: false,
    },
    xpRecompensa: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Atividade', AtividadeSchema);
