const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema(
  {
    jornadaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jornada',
      required: true,
      index: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    xpRecompensa: {
      type: Number,
      required: true,
      default: 10, // Um valor padrão, caso não seja preenchido
    },
    status: {
      type: String,
      enum: ['Pendente', 'Aguardando Validação', 'Concluída'],
      default: 'Pendente',
    },
    urlComprovante: {
      type: String, // URL da foto/vídeo hospedada na nuvem
      trim: true,
      default: null,
    },
    dataConclusao: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tarefa', TarefaSchema);