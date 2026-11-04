
import { getToken } from "../hooks/useAuth";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://evoluame.onrender.com";

export async function verificarChatAutenticado() {
  const token = await getToken();

  if (!token) {
    throw new Error("Usuário não está autenticado.");
  }

  const resposta = await fetch(`${BASE_URL}/api/chat/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro ?? "Erro ao verificar autenticação do chat."
    );
  }

  return dados;
}


export interface ConversaCriada {
  conversaId: string;
  amigo: {
    id: string;
    nome: string;
  };
}

export async function iniciarConversa(
  token: string,
  amigoId: string,
): Promise<ConversaCriada> {
  const resposta = await fetch(`${BASE_URL}/api/chat/conversas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amigoId }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro ?? "Não foi possível iniciar a conversa.",
    );
  }

  return dados as ConversaCriada;
}

