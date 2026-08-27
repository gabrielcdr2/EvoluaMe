import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {
  const [nome, setNome] = useState('');
  const [focado, setFocado] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleComecar = async () => {
    if (!nome.trim()) {
      shake();
      return;
    }
    try {
      await AsyncStorage.setItem('@evolua_nome', nome.trim());
    } catch (_) {}
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>


          {/* Header */}
          <View style={styles.headerArea}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>EvoluaMe</Text>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Sua jornada começa aqui</Text>
              </View>
            </View>
          </View>

          {/* Card central */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{'Olá! Qual é o\nseu nome?'}</Text>
            <Text style={styles.cardSubtitle}>
              Vamos personalizar sua experiência de evolução.
            </Text>

            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View style={[styles.inputWrapper, focado && styles.inputWrapperFocado]}>
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu nome..."
                  placeholderTextColor="#B0A4D8"
                  value={nome}
                  onChangeText={setNome}
                  onFocus={() => setFocado(true)}
                  onBlur={() => setFocado(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleComecar}
                  autoCapitalize="words"
                />
              </View>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.botao, !nome.trim() && styles.botaoDesabilitado]}
                onPress={handleComecar}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
              >
                <Text style={styles.botaoTexto}>Começar minha jornada</Text>
                <Text style={styles.botaoIcone}>→</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Rodapé decorativo */}
          <View style={styles.footer}>
            <View style={styles.footerDot} />
            <View style={[styles.footerDot, styles.footerDotActive]} />
            <View style={styles.footerDot} />
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F4FF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Header
  headerArea: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1040',
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(108, 76, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108, 76, 255, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#6C4CFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1040',
    marginBottom: 10,
    lineHeight: 36,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#7C6FAE',
    marginBottom: 28,
    lineHeight: 22,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2DEFF',
    paddingHorizontal: 16,
    paddingLeft: 20,
    height: 58,
    marginBottom: 20,
  },
  inputWrapperFocado: {
    borderColor: '#6C4CFF',
    backgroundColor: '#EFECFF',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1040',
    fontWeight: '500',
  },

  // Botão
  botao: {
    backgroundColor: '#6C4CFF',
    borderRadius: 16,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C4CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  botaoDesabilitado: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  botaoIcone: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  // Footer dots
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D0FF',
    marginHorizontal: 3,
  },
  footerDotActive: {
    width: 20,
    backgroundColor: '#6C4CFF',
  },
});
