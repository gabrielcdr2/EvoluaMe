
const mongoose = require('mongoose');

const AmizadeSchema = new mongoose.Schema(
  {
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    destinatario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'aceita', 'recusada'],
      default: 'pendente',
    },
  },
  { timestamps: true }
);

// Evita solicitações duplicadas na mesma direção
AmizadeSchema.index(
  { solicitante: 1, destinatario: 1 },
  { unique: true }
);

module.exports = mongoose.model('Amizade', AmizadeSchema);
