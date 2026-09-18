const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            index: true,
            unique: true, // Recomendado para evitar duplicidade
        },
        nome: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        senha: {
            type: String,
            required: true,
            trim: true,
        },
        nivelGlobal: {
            type: Number,
            default: 1,
        },
        xpTotal: {
            type: Number,
            default: 0,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Usuario', UsuarioSchema);
