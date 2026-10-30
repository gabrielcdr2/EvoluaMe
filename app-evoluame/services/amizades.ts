
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://evoluame.onrender.com";

export interface UsuarioAmigo {
  _id: string;
  nome: string;
  email: string;
}

export interface SolicitacaoAmizade {
  _id: string;
  solicitante: UsuarioAmigo;
  destinatario?: UsuarioAmigo;
  status: "pendente" | "aceita" | "recusada";
  createdAt?: string;
}

export interface Amizade {
  amizadeId: string;
  usuario: UsuarioAmigo;
}

async function requisicaoAmizade<T>(
  token: string,
  caminho: string,
  metodo: "GET" | "POST" | "PATCH" = "GET",
  corpo?: object,
): Promise<T> {
  const resposta = await fetch(`${BASE_URL}/api/amizades${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro ?? "Erro no sistema de amizades.");
  }

  return dados as T;
}

// Buscar usuário pelo e-mail
export async function buscarUsuarioAmigo(
  token: string,
  email: string,
): Promise<UsuarioAmigo> {
  return requisicaoAmizade<UsuarioAmigo>(
    token,
    `/buscar?email=${encodeURIComponent(email.trim())}`,
  );
}

// Enviar solicitação
export async function solicitarAmizade(
  token: string,
  email: string,
) {
  return requisicaoAmizade(
    token,
    "/solicitar",
    "POST",
    { email: email.trim() },
  );
}

// Consultar solicitações recebidas
export async function buscarSolicitacoesAmizade(
  token: string,
): Promise<SolicitacaoAmizade[]> {
  return requisicaoAmizade<SolicitacaoAmizade[]>(
    token,
    "/solicitacoes",
  );
}

// Aceitar solicitação
export async function aceitarSolicitacaoAmizade(
  token: string,
  solicitacaoId: string,
) {
  return requisicaoAmizade(
    token,
    `/${solicitacaoId}/aceitar`,
    "PATCH",
  );
}

// Recusar solicitação
export async function recusarSolicitacaoAmizade(
  token: string,
  solicitacaoId: string,
) {
  return requisicaoAmizade(
    token,
    `/${solicitacaoId}/recusar`,
    "PATCH",
  );
}

// Consultar amigos
export async function listarAmigos(
  token: string,
): Promise<Amizade[]> {
  return requisicaoAmizade<Amizade[]>(token, "/");
}
