require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const atividadesRoutes = require('./routes/atividades');
const progressoRoutes = require('./routes/progresso');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ────────────────────────────────────────────
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : '*',
  })
);

// ─── Rotas ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: '🚀 EvoluaMe API rodando!' });
});

app.use('/api/atividades', atividadesRoutes);
app.use('/api/progresso', progressoRoutes);

// ─── Banco de Dados ──────────────────────────────────────────
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas!');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
}

// ─── Iniciar servidor ────────────────────────────────────────
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});