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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { loginAPI } from '../services/api';
import { salvarSessao } from '../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setErro('');
    if (!email.trim() || !password.trim()) {
      setErro('Preencha o email e a senha para continuar.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginAPI(email.trim(), password);
      await salvarSessao(data.token, data.usuario);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErro(err.message ?? 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/cadastro');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Forma verde de fundo decorativa */}
      <View style={styles.backgroundShape} />

      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Card de Login */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, erro ? styles.inputError : null]}
            placeholder="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setErro(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, erro ? styles.inputError : null]}
            placeholder="Senha"
            value={password}
            onChangeText={(v) => { setPassword(v); setErro(''); }}
            secureTextEntry
          />
        </View>

        {/* Mensagem de erro inline */}
        {!!erro && (
          <View style={styles.erroContainer}>
            <Ionicons name="alert-circle-outline" size={16} color="#E53E3E" />
            <Text style={styles.erroText}>{erro}</Text>
          </View>
        )}

        {/* Checkbox Lembrar Senha */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setRemember(!remember)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={remember ? 'checkbox' : 'square-outline'}
            size={24}
            color="#333"
          />
          <View style={styles.checkboxTexts}>
            <Text style={styles.checkboxLabel}>Lembrar senha?</Text>
            <Text style={styles.checkboxSub}>Manter conectado</Text>
          </View>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Botão Registrar */}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Criar conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  logo: {
    width: 250,
    height: 100,
    marginBottom: 40,
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
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  erroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  erroText: {
    color: '#E53E3E',
    fontSize: 13,
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkboxTexts: {
    marginLeft: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  checkboxSub: {
    fontSize: 12,
    color: '#888',
  },
  primaryButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
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