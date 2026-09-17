// Centraliza todas as chamadas HTTP para a API do EvoluaMe
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

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
