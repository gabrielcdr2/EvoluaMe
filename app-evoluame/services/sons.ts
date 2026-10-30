import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_SONS = "@evoluame_sons_ativados";

// Os sons ficam ativados por padrão.
export async function obterSonsAtivados(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(CHAVE_SONS);
    return valor !== "false";
  } catch (erro) {
    console.log("Erro ao consultar preferência de sons:", erro);
    return true;
  }
}

// Salva a escolha do usuário no dispositivo.
export async function salvarSonsAtivados(ativados: boolean): Promise<void> {
  await AsyncStorage.setItem(CHAVE_SONS, ativados ? "true" : "false");
}
