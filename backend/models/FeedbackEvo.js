const mongoose = require('mongoose');

const FeedbackEvoSchema = new mongoose.Schema(
  {
    tarefaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tarefa',
      required: true,
      index: true,
    },
    usuarioId: {
      type: String, // String porque o ID do usuário no EvoluaMe é um UUID no modelo atual
      required: true,
      index: true,
    },
    descricaoEnviada: {
      type: String,
      required: true,
    },
    urlImagem: {
      type: String,
      default: null,
    },
    aprovado: {
      type: Boolean,
      required: true,
    },
    mensagemMentor: {
      type: String,
      required: true,
    },
    motivoReprovacao: {
      type: String,
      default: '',
    },
    xpExtra: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedbackEvo', FeedbackEvoSchema);
