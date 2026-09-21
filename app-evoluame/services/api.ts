// Centraliza todas as chamadas HTTP para a API do EvoluaMe
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://evoluame.onrender.com';

// ─── Auth ─────────────────────────────────────────────────────

export interface UsuarioInfo {
  id: string;
  nome: string;
  email: string;
  nivelGlobal: number;
  xpTotal: number;
}

export interface AuthResponse {
  mensagem: string;
  token: string;
  usuario: UsuarioInfo;
}

export async function loginAPI(email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? 'Erro ao fazer login');
  return data;
}

export async function cadastroAPI(nome: string, email: string, senha: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? 'Erro ao cadastrar');
  return data;
}

// ─── Atividades ──────────────────────────────────────────────

export async function buscarAtividades(usuarioId: string, area?: string) {
  const params = new URLSearchParams({ usuarioId });
  if (area) params.append('area', area);

  const res = await fetch(`${BASE_URL}/api/atividades?${params}`);
  if (!res.ok) throw new Error('Erro ao buscar atividades');
  return res.json();
}

export async function criarAtividade(usuarioId: string, area: string, nome: string) {
  const res = await fetch(`${BASE_URL}/api/atividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId, area, nome }),
  });
  if (!res.ok) throw new Error('Erro ao criar atividade');
  return res.json();
}

export async function deletarAtividade(id: string) {
  const res = await fetch(`${BASE_URL}/api/atividades/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao remover atividade');
  return res.json();
}

// ─── Progresso (XP / Nível) ──────────────────────────────────

export async function buscarProgresso(usuarioId: string) {
  const res = await fetch(`${BASE_URL}/api/progresso/${usuarioId}`);
  if (!res.ok) throw new Error('Erro ao buscar progresso');
  return res.json();
}

export async function concluirAtividadeAPI(usuarioId: string, atividadeId: string) {
  const res = await fetch(`${BASE_URL}/api/progresso/concluir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId, atividadeId }),
  });
  if (!res.ok) throw new Error('Erro ao concluir atividade');
  return res.json();
}

// ─── Jornadas ─────────────────────────────────────────────────

export interface Jornada {
  _id: string;
  titulo: string;
  categoria: string;
  nivelJornada: number;
  xpJornada: number;
  status: 'Ativa' | 'Pausada' | 'Concluída';
  createdAt: string;
}

export interface Tarefa {
  _id: string;
  jornadaId: string;
  titulo: string;
  descricao?: string;
  xpRecompensa: number;
  status: 'Pendente' | 'Aguardando Validação' | 'Concluída';
  urlComprovante?: string | null;
  dataConclusao?: string | null;
  requerAnexo?: boolean;
}

export async function buscarJornadaAtiva(token: string): Promise<{ jornada: Jornada | null; tarefas: Tarefa[] }> {
  const res = await fetch(`${BASE_URL}/api/jornadas/ativa`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao buscar jornada ativa');
  return res.json();
}

export async function criarJornada(token: string, titulo: string, categoria: string): Promise<Jornada> {
  const res = await fetch(`${BASE_URL}/api/jornadas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ titulo, categoria }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? 'Erro ao criar jornada');
  return data;
}

export async function criarTarefa(
  token: string,
  jornadaId: string,
  titulo: string,
  descricao: string,
  xpRecompensa: number,
  requerAnexo: boolean = false
): Promise<Tarefa> {
  const res = await fetch(`${BASE_URL}/api/tarefas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jornadaId, titulo, descricao, xpRecompensa, requerAnexo }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? 'Erro ao criar tarefa');
  return data;
}

export interface FeedbackEvo {
  _id: string;
  tarefaId: string;
  usuarioId: string;
  descricaoEnviada: string;
  urlImagem: string | null;
  aprovado: boolean;
  mensagemMentor: string;
  motivoReprovacao: string;
  xpExtra: number;
  createdAt: string;
}

export interface ConcluirTarefaResponse {
  tarefa: Tarefa;
  xpGanho: number;
  xpBase: number;
  xpExtra: number;
  subiuDeNivel: boolean;
  novoNivel: number;
  novoXpTotal: number;
  feedbacks?: FeedbackEvo[];
  mensagem: string;
}

export async function concluirTarefa(
  token: string,
  tarefaId: string,
  descricaoUsuario?: string,
  base64Imagem?: string
): Promise<ConcluirTarefaResponse> {
  const res = await fetch(`${BASE_URL}/api/tarefas/${tarefaId}/concluir`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ descricaoUsuario, base64Imagem }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? 'Erro ao concluir tarefa');
  return data;
}

export async function buscarFeedbacksEvo(token: string, tarefaId: string): Promise<FeedbackEvo[]> {
  const res = await fetch(`${BASE_URL}/api/tarefas/${tarefaId}/feedbacks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao buscar feedbacks');
  return res.json();
}

export async function buscarTarefa(token: string, tarefaId: string): Promise<Tarefa> {
  const res = await fetch(`${BASE_URL}/api/tarefas/${tarefaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Erro ao buscar tarefa');
  return res.json();
}
