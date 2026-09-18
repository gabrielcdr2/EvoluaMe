import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const TOKEN_KEY = '@evolua_token';
const USUARIO_KEY = '@evolua_usuario';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  nivelGlobal: number;
  xpTotal: number;
}

/** Salva token e dados do usuário após login/cadastro */
export async function salvarSessao(token: string, usuario: UsuarioSessao) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

/** Remove token e dados (logout) */
export async function limparSessao() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
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
    async function carregar() {
      try {
        const [tok, usuarioJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USUARIO_KEY),
        ]);
        setToken(tok);
        setUsuario(usuarioJson ? JSON.parse(usuarioJson) : null);
      } catch (e) {
        console.log('Erro ao carregar sessão:', e);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return { usuario, token, carregando };
}
