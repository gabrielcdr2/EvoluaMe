import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Gera um UUID v4 simples para identificar o usuário localmente
// enquanto não há sistema de autenticação implementado
function gerarId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Retorna um ID estável para o usuário atual.
 * Na primeira execução, gera um UUID e salva em AsyncStorage.
 * Quando auth for implementado, substitua por um ID real.
 */
export function useUsuario() {
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  useEffect(() => {
    async function inicializar() {
      try {
        let id = await AsyncStorage.getItem('@evolua_usuario_id');
        if (!id) {
          id = gerarId();
          await AsyncStorage.setItem('@evolua_usuario_id', id);
        }
        setUsuarioId(id);
      } catch (error) {
        console.log('Erro ao inicializar usuário:', error);
      }
    }
    inicializar();
  }, []);

  return usuarioId;
}
