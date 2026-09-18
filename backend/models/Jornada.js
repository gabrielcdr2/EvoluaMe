const mongoose = require('mongoose');

const JornadaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario', 
      required: true,
      index: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['Físico', 'Mental'],
      required: true, 
    },
    nivelJornada: {
      type: Number,
      default: 1,
    },
    xpJornada: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Ativa', 'Pausada', 'Concluída'], 
      default: 'Ativa',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Jornada', JornadaSchema);