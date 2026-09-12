import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    // Adicione a lógica de autenticação aqui
    // Exemplo de navegação após login:
    router.replace('/(tabs)/home');
  };

  const handleRegister = () => {
    // Adicione a lógica de redirecionamento para o cadastro aqui
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
        // Substitua pelo caminho correto da sua logo no seu projeto
        source={require('../assets/images/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />

      {/* Card de Login */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Checkbox Lembrar Senha */}
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setRemember(!remember)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={remember ? "checkbox" : "square-outline"} 
            size={24} 
            color="#333" 
          />
          <View style={styles.checkboxTexts}>
            <Text style={styles.checkboxLabel}>Lembrar senha?</Text>
            <Text style={styles.checkboxSub}>Manter conectado</Text>
          </View>
        </TouchableOpacity>

        {/* Botões */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrar</Text>
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
    backgroundColor: '#20C997', // Verde similar ao da imagem
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});