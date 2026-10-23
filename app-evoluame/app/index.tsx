import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  AccessibilityInfo,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { loginAPI } from "../services/api";
import { salvarSessao } from "../hooks/useAuth";
import { biometriaAtivada, confirmarBiometria } from "../services/biometria";
import { useAcessibilidade } from "@/contexts/AcessibilidadeContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const router = useRouter();

  const { tema, tamanhoFonte } = useAcessibilidade();

  const escuro = tema === "dark";

  const fundo = escuro ? "#131313" : "#FFFFFF";
  const fundoCard = escuro ? "#212124" : "#FFFFFF";
  const texto = escuro ? "#FFFFFF" : "#333333";
  const secundario = escuro ? "#C6C6CB" : "#666666";
  const fundoInput = escuro ? "#303034" : "#FAFAFA";
  const bordaInput = escuro ? "#77777E" : "#B0B0B0";
  const fundoBotao = escuro ? "#2FD98D" : "#333333";
  const textoBotao = escuro ? "#161616" : "#FFFFFF";

  useEffect(() => {
    if (erro) {
      AccessibilityInfo.announceForAccessibility(erro);
    }
  }, [erro]);

  const handleLogin = async () => {
    if (loading) return;

    setErro("");

    if (!email.trim() || !password.trim()) {
      setErro("Preencha o email e a senha para continuar.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginAPI(email.trim(), password);

      const exigeBiometria = await biometriaAtivada(data.usuario.id);

      if (exigeBiometria) {
        const autenticado = await confirmarBiometria();

        if (!autenticado) {
          setErro(
            "Confirmação biométrica não realizada. Acesso não autorizado.",
          );
          return;
        }
      }

      await salvarSessao(data.token, data.usuario);
    } catch (err: any) {
      setErro(err?.message ?? "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/cadastro");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: fundo }]}
    >
      <View
        style={styles.backgroundShape}
        accessible={false}
        importantForAccessibility="no"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Logo do EvoluaMe"
        />

        <View style={[styles.card, { backgroundColor: fundoCard }]}>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: texto,
                  fontSize: 14 * tamanhoFonte,
                },
              ]}
            >
              Email
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: texto,
                  backgroundColor: fundoInput,
                  borderColor: bordaInput,
                  fontSize: 16 * tamanhoFonte,
                },
                erro ? styles.inputError : null,
              ]}
              placeholder="Email"
              placeholderTextColor={secundario}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErro("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              accessibilityLabel="Email"
              accessibilityHint="Digite seu endereço de email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                {
                  color: texto,
                  fontSize: 14 * tamanhoFonte,
                },
              ]}
            >
              Senha
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: texto,
                  backgroundColor: fundoInput,
                  borderColor: bordaInput,
                  fontSize: 16 * tamanhoFonte,
                },
                erro ? styles.inputError : null,
              ]}
              placeholder="Senha"
              placeholderTextColor={secundario}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErro("");
              }}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              accessibilityLabel="Senha"
              accessibilityHint="Digite sua senha"
            />
          </View>

          {!!erro && (
            <View
              style={styles.erroContainer}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color="#E53E3E"
                accessible={false}
              />

              <Text style={[styles.erroText, { fontSize: 13 * tamanhoFonte }]}>
                {erro}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRemember(!remember)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityLabel="Manter conectado"
            accessibilityHint="Alterna a preferência visual de manter conectado"
            accessibilityState={{ checked: remember }}
          >
            <Ionicons
              name={remember ? "checkbox" : "square-outline"}
              size={24}
              color={texto}
              accessible={false}
            />

            <View style={styles.checkboxTexts} accessible={false}>
              <Text
                style={[
                  styles.checkboxLabel,
                  {
                    color: texto,
                    fontSize: 14 * tamanhoFonte,
                  },
                ]}
              >
                Lembrar senha?
              </Text>

              <Text
                style={[
                  styles.checkboxSub,
                  {
                    color: secundario,
                    fontSize: 12 * tamanhoFonte,
                  },
                ]}
              >
                Manter conectado
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: fundoBotao },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? "Entrando na conta" : "Entrar"}
            accessibilityHint="Realiza login no EvoluaMe"
            accessibilityState={{
              disabled: loading,
              busy: loading,
            }}
          >
            {loading ? (
              <ActivityIndicator color={textoBotao} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: textoBotao,
                    fontSize: 16 * tamanhoFonte,
                  },
                ]}
              >
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: fundoBotao }]}
            onPress={handleRegister}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
            accessibilityHint="Abre a tela de cadastro"
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: textoBotao,
                  fontSize: 16 * tamanhoFonte,
                },
              ]}
            >
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  backgroundShape: {
    position: "absolute",
    bottom: -100,
    left: -150,
    width: 500,
    height: 500,
    backgroundColor: "#20C997",
    transform: [{ rotate: "45deg" }],
    zIndex: 0,
  },

  logo: {
    width: 250,
    height: 100,
    marginBottom: 40,
    zIndex: 1,
  },

  card: {
    width: "85%",
    padding: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 6,
    fontWeight: "500",
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },

  inputError: {
    borderColor: "#E53E3E",
    backgroundColor: "#FFF5F5",
  },

  erroContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FED7D7",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },

  erroText: {
    color: "#C53030",
    flex: 1,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    minHeight: 48,
  },

  checkboxTexts: {
    marginLeft: 8,
  },

  checkboxLabel: {
    fontWeight: "500",
  },

  checkboxSub: {},

  primaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginBottom: 12,
  },

  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontWeight: "600",
  },
});
