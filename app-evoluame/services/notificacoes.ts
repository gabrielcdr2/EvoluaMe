import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registrarNotificacoesPush(): Promise<string | null> {
  // Push nativo não será registrado na versão web.
  if (Platform.OS === "web") {
    console.log("Push nativo indisponível na web.");
    return null;
  }

  // Notificações push exigem um dispositivo físico.
  if (!Device.isDevice) {
    console.log("Use um dispositivo físico para testar push.");
    return null;
  }

  try {
    // Canal de notificações para Android.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Notificações do EvoluaMe",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#2FD98D",
      });
    }

    // Verifica se a permissão já foi concedida.
    const permissaoAtual = await Notifications.getPermissionsAsync();

    let status = permissaoAtual.status;

    // Solicita permissão somente se necessário.
    if (status !== "granted") {
      const resposta = await Notifications.requestPermissionsAsync();

      status = resposta.status;
    }

    // Respeita a decisão do usuário.
    if (status !== "granted") {
      console.log("Permissão de notificações não concedida.");
      return null;
    }

    // Identifica o projeto Expo/EAS.
    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log("Project ID do EAS ainda não configurado.");
      return null;
    }

    // Obtém o token que identifica este dispositivo.
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  } catch (erro) {
    console.log("Erro ao registrar notificações:", erro);
    return null;
  }
}
