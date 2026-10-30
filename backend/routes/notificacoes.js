const express = require("express");
const router = express.Router();

const Usuario = require("../models/Usuario");
const { autenticar } = require("../middleware/auth");

// Verifica o formato básico de um Expo Push Token
function tokenExpoValido(token) {
  return (
    typeof token === "string" &&
    token.length <= 256 &&
    /^(ExpoPushToken|ExponentPushToken)\[[A-Za-z0-9_-]+\]$/.test(token)
  );
}

// POST /api/notificacoes/registrar
// Registra o dispositivo do usuário autenticado
router.post("/registrar", autenticar, async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!tokenExpoValido(pushToken)) {
      return res.status(400).json({
        erro: "Expo Push Token inválido.",
      });
    }

    // Evita associar o mesmo dispositivo a contas diferentes
    await Usuario.updateMany(
      {
        id: { $ne: req.usuario.id },
        expoPushTokens: pushToken,
      },
      {
        $pull: { expoPushTokens: pushToken },
      },
    );

    // Adiciona o token sem criar duplicações
    await Usuario.updateOne(
      { id: req.usuario.id },
      {
        $addToSet: { expoPushTokens: pushToken },
      },
    );

    return res.json({
      mensagem: "Dispositivo registrado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao registrar dispositivo:", erro);

    return res.status(500).json({
      erro: "Não foi possível registrar o dispositivo.",
    });
  }
});

// DELETE /api/notificacoes/registrar
// Remove o token ao desvincular o dispositivo
router.delete("/registrar", autenticar, async (req, res) => {
  try {
    const { pushToken } = req.body;

    if (!tokenExpoValido(pushToken)) {
      return res.status(400).json({
        erro: "Expo Push Token inválido.",
      });
    }

    await Usuario.updateOne(
      { id: req.usuario.id },
      {
        $pull: { expoPushTokens: pushToken },
      },
    );

    return res.json({
      mensagem: "Dispositivo desvinculado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao desvincular dispositivo:", erro);

    return res.status(500).json({
      erro: "Não foi possível desvincular o dispositivo.",
    });
  }
});

module.exports = router;
