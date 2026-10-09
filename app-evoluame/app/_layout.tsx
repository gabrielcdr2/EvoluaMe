import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import {
  AcessibilidadeProvider,
  useAcessibilidade,
} from "@/contexts/AcessibilidadeContext";

function Navegacao() {
  const { tema } = useAcessibilidade();

  return (
    <ThemeProvider value={tema === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="welcome" options={{ headerShown: false }} />

        <Stack.Screen name="cadastro" options={{ headerShown: false }} />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="atividades" options={{ headerShown: false }} />

        <Stack.Screen name="nova-jornada" options={{ headerShown: false }} />

        <Stack.Screen name="nova-tarefa" options={{ headerShown: false }} />

        <Stack.Screen name="configuracoes" options={{ headerShown: false }} />

        <Stack.Screen name="libras" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
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
