import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  AccessibilityInfo,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { cadastroAPI } from "../services/api";
import { salvarSessao } from "../hooks/useAuth";
import { useAcessibilidade } from "@/contexts/AcessibilidadeContext";

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const senhasDiferentes =
    confirmarSenha.length > 0 && senha !== confirmarSenha;

  const mostrarErro = (titulo: string, mensagem: string) => {
    AccessibilityInfo.announceForAccessibility(mensagem);

    if (Platform.OS === "web") {
      // Alert.alert não funciona da mesma forma na web.
      // Mantemos o anúncio acessível e exibimos a mensagem
      // com o alerta nativo do navegador.
      if (typeof window !== "undefined") {
        window.alert(`${titulo}: ${mensagem}`);
      }
    } else {
      Alert.alert(titulo, mensagem);
    }
  };

  const handleCadastro = async () => {
    if (loading) return;

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      mostrarErro("Atenção", "Preencha todos os campos para continuar.");
      return;
    }

    if (senha !== confirmarSenha) {
      mostrarErro("Atenção", "As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      mostrarErro("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const data = await cadastroAPI(nome.trim(), email.trim(), senha);

      await salvarSessao(data.token, data.usuario);

      router.replace("/(tabs)/home");
    } catch (err: any) {
      mostrarErro("Erro ao cadastrar", err?.message ?? "Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.back();
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
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Logo do EvoluaMe"
        />

        <View style={[styles.card, { backgroundColor: fundoCard }]}>
          <Text
            style={[
              styles.title,
              {
                color: texto,
                fontSize: 22 * tamanhoFonte,
              },
            ]}
            accessibilityRole="header"
          >
            Criar conta
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: secundario,
                fontSize: 14 * tamanhoFonte,
              },
            ]}
          >
            Comece sua jornada de evolução!
          </Text>

          {/* Nome */}
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
              Nome
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
              ]}
              placeholder="Seu nome completo"
              placeholderTextColor={secundario}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              autoComplete="name"
              accessibilityLabel="Nome completo"
              accessibilityHint="Digite seu nome completo"
            />
          </View>

          {/* Email */}
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
              ]}
              placeholder="seu@email.com"
              placeholderTextColor={secundario}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email"
              accessibilityHint="Digite seu endereço de email"
            />
          </View>

          {/* Senha */}
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

            <View
              style={[
                styles.passwordWrapper,
                {
                  backgroundColor: fundoInput,
                  borderColor: bordaInput,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    color: texto,
                    fontSize: 16 * tamanhoFonte,
                  },
                ]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={secundario}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoComplete="new-password"
                accessibilityLabel="Senha"
                accessibilityHint="Crie uma senha com pelo menos seis caracteres"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarSenha(!mostrarSenha)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                }
                accessibilityHint="Alterna a visibilidade da senha"
                accessibilityState={{ selected: mostrarSenha }}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={secundario}
                  accessible={false}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar senha */}
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
              Confirmar senha
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: texto,
                  backgroundColor: fundoInput,
                  borderColor: senhasDiferentes ? "#E53E3E" : bordaInput,
                  fontSize: 16 * tamanhoFonte,
                },
              ]}
              placeholder="Repita sua senha"
              placeholderTextColor={secundario}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarSenha}
              autoComplete="new-password"
              accessibilityLabel="Confirmar senha"
              accessibilityHint="Digite novamente a senha criada"
            />

            {senhasDiferentes && (
              <Text
                style={[styles.errorText, { fontSize: 12 * tamanhoFonte }]}
                accessibilityLiveRegion="polite"
              >
                As senhas não coincidem
              </Text>
            )}
          </View>

          {/* Cadastrar */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: fundoBotao },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleCadastro}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? "Criando conta" : "Criar conta"}
            accessibilityHint="Envia seus dados para cadastrar uma conta"
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
                Criar conta
              </Text>
            )}
          </TouchableOpacity>

          {/* Voltar ao login */}
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: fundoBotao }]}
            onPress={handleVoltar}
            accessibilityRole="button"
            accessibilityLabel="Já tenho conta"
            accessibilityHint="Voltar para a tela de login"
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
              Já tenho conta
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

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  logo: {
    width: 250,
    height: 100,
    marginBottom: 32,
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

  title: {
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    marginBottom: 24,
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

  errorText: {
    color: "#E53E3E",
    marginTop: 4,
  },

  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },

  eyeButton: {
    paddingHorizontal: 12,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginBottom: 12,
    marginTop: 8,
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
