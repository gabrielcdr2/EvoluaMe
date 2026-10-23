import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { getToken, limparSessao, observarSessao } from "../hooks/useAuth";

import {
  AcessibilidadeProvider,
  useAcessibilidade,
} from "@/contexts/AcessibilidadeContext";

function Navegacao() {
  const { tema } = useAcessibilidade();

  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Executa somente quando o layout é iniciado.
    // Impede que uma sessão antiga libere o acesso.
    async function iniciarSessao() {
      try {
        await limparSessao();
      } catch (erro) {
        console.log("Erro ao iniciar sessão:", erro);
      } finally {
        if (ativo) {
          setAutenticado(false);
          setVerificando(false);
        }
      }
    }

    // Nas mudanças posteriores, apenas consulta o token.
    // Não apaga a sessão criada pelo login.
    async function atualizarSessao() {
      try {
        const token = await getToken();

        if (ativo) {
          setAutenticado(!!token);
        }
      } catch (erro) {
        if (ativo) {
          setAutenticado(false);
        }

        console.log("Erro ao atualizar sessão:", erro);
      }
    }

    // Registra o observador antes da inicialização.
    const pararObservacao = observarSessao(() => {
      atualizarSessao();
    });

    iniciarSessao();

    return () => {
      ativo = false;
      pararObservacao();
    };
  }, []);

  if (verificando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2FD98D" />
      </View>
    );
  }

  return (
    <ThemeProvider value={tema === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Telas públicas */}
        <Stack.Protected guard={!autenticado}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Telas privadas */}
        <Stack.Protected guard={autenticado}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="atividades" options={{ headerShown: false }} />
          <Stack.Screen name="nova-jornada" options={{ headerShown: false }} />
          <Stack.Screen name="nova-tarefa" options={{ headerShown: false }} />
          <Stack.Screen name="configuracoes" options={{ headerShown: false }} />
          <Stack.Screen name="libras" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style={tema === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AcessibilidadeProvider>
      <Navegacao />
    </AcessibilidadeProvider>
  );
}
