import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';

export default function App() {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Título */}
        <Text style={styles.title}>Cadastre-se</Text>

        {/* Card Branco */}
        <View style={styles.card}>
          
          {/* Campo: Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#999"
            />
          </View>

          {/* Campo: E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Campo: Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Campo: Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput 
              style={styles.input} 
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Campo: Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput 
              style={styles.input}  
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {/* Botão Registrar */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fundo da tela branco
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60, // Espaço do topo
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#20C997', // Verde esmeralda aproximado da imagem
    marginBottom: 24,
    alignSelf: 'flex-start', // Alinha o título à esquerda
    marginLeft: 10, // Pequeno ajuste para alinhar com o card
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Sombra para Android
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0', // Borda sutil
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#2C2C2C', // Cinza escuro/Preto
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
});