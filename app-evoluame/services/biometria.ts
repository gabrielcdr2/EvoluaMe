import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export async function biometriaAtivada(usuarioId: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const chave = `native:${usuarioId}`;
  const valor = await AsyncStorage.getItem(chave);

  return valor === "true";
}

export async function confirmarBiometria(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const temHardware = await LocalAuthentication.hasHardwareAsync();
  const cadastrada = await LocalAuthentication.isEnrolledAsync();

  if (!temHardware || !cadastrada) {
    return false;
  }

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirme sua identidade para entrar no EvoluaMe",
    cancelLabel: "Cancelar",
    disableDeviceFallback: false,
  });

  return resultado.success;
}
