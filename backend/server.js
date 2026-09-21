require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const atividadesRoutes = require('./routes/atividades');
const progressoRoutes = require('./routes/progresso');
const authRoutes = require('./routes/auth');
const jornadasRoutes = require('./routes/jornadas');
const tarefasRoutes = require('./routes/tarefas');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// Origens sempre permitidas (além das definidas em CORS_ORIGINS)
const ORIGENS_EXTRA = [/\.vercel\.app$/, /localhost/];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: mobile, Postman)
      if (!origin) return callback(null, true);

      // Checa origens explícitas da variável de ambiente
      const lista = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
        : [];

      if (lista.includes(origin)) return callback(null, true);

      // Checa padrões extras (qualquer subdomínio vercel.app e localhost)
      const permitido = ORIGENS_EXTRA.some((padrao) => padrao.test(origin));
      if (permitido) return callback(null, true);

      callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);

// ─── Rotas ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: '🚀 EvoluaMe API rodando!' });
});

app.use('/api/atividades', atividadesRoutes);
app.use('/api/progresso', progressoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/jornadas', jornadasRoutes);
app.use('/api/tarefas', tarefasRoutes);

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