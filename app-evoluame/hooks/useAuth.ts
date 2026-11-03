import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const TOKEN_KEY = "@evolua_token";
const USUARIO_KEY = "@evolua_usuario";
const ouvintesSessao = new Set<() => void>();

export function avisarMudancaSessao() {
  ouvintesSessao.forEach((ouvinte) => ouvinte());
}

export function observarSessao(ouvinte: () => void) {
  ouvintesSessao.add(ouvinte);

  return () => {
    ouvintesSessao.delete(ouvinte);
  };
}

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  nivelGlobal: number;
  xpTotal: number;
}

/** Salva token e dados do usuário após login/cadastro */
export async function salvarSessao(token: string, usuario: UsuarioSessao) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USUARIO_KEY, JSON.stringify(usuario)],
  ]);

  avisarMudancaSessao();
}

/** Remove token e dados (logout) */
export async function limparSessao() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
  avisarMudancaSessao();
}

/** Retorna o token salvo (para enviar nas requisições autenticadas) */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Hook que retorna os dados do usuário logado e o token da sessão.
 * Lê diretamente do AsyncStorage (sem chamada à API).
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const [tok, usuarioJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USUARIO_KEY),
        ]);

        if (!ativo) return;

        setToken(tok);
        setUsuario(usuarioJson ? JSON.parse(usuarioJson) : null);
      } catch (erro) {
        console.log("Erro ao carregar sessão:", erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    const pararObservacao = observarSessao(carregar);

    return () => {
      ativo = false;
      pararObservacao();
    };
  }, []);

  return { usuario, token, carregando };
}