import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cadastroAPI } from '../services/api';
import { salvarSessao } from '../hooks/useAuth';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos para continuar.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const data = await cadastroAPI(nome.trim(), email.trim(), senha);
      await salvarSessao(data.token, data.usuario);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Forma verde de fundo decorativa */}
      <View style={styles.backgroundShape} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Card de Cadastro */}
        <View style={styles.card}>
          {/* Título */}
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Comece sua jornada de evolução!</Text>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setMostrarSenha(!mostrarSenha)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={[
                styles.input,
                confirmarSenha.length > 0 && senha !== confirmarSenha
                  ? styles.inputError
                  : null,
              ]}
              placeholder="Repita sua senha"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarSenha}
            />
            {confirmarSenha.length > 0 && senha !== confirmarSenha && (
              <Text style={styles.errorText}>As senhas não coincidem</Text>
            )}
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>

          {/* Voltar */}
          <TouchableOpacity style={styles.secondaryButton} onPress={handleVoltar}>
            <Text style={styles.buttonText}>Já tenho conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  backgroundShape: {
    position: 'absolute',
    bottom: -100,
    left: -150,
    width: 500,
    height: 500,
    backgroundColor: '#20C997',
    transform: [{ rotate: '45deg' }],
    zIndex: 0,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 250,
    height: 100,
    marginBottom: 32,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  primaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
