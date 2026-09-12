import React, { useState } from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WelcomeScreen() {

  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');

  async function iniciarJornada() {

    const nomeDigitado = nome.trim();

    if (nomeDigitado === '') {

      setErro('Digite seu nome para continuar.');

      return;
    }

    try {

      await AsyncStorage.setItem(
        '@evolua_nome',
        nomeDigitado
      );

      setErro('');

      router.replace('/(tabs)/home');

    } catch (error) {

      console.log(
        'Erro ao salvar o nome:',
        error
      );

    }
  }

  function alterarNome(valor: string) {

    setNome(valor);

    if (erro !== '') {
      setErro('');
    }
  }

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        EvoluaMe
      </Text>

      <Text style={styles.subtitulo}>
        Sua jornada começa aqui
      </Text>

      <Text style={styles.titulo}>
        Olá! Qual é o seu nome?
      </Text>

      <TextInput
        style={[
          styles.input,
          erro !== '' && styles.inputErro
        ]}
        value={nome}
        onChangeText={alterarNome}
        placeholder="Digite seu nome..."
        placeholderTextColor="#999"
        returnKeyType="done"
        onSubmitEditing={iniciarJornada}
      />

      {erro !== '' && (

        <Text style={styles.erro}>
          ⚠ {erro}
        </Text>

      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={iniciarJornada}
      >

        <Text style={styles.botaoTexto}>
          Começar minha jornada →
        </Text>

      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#F5F4FF',
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6C4CFF',
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 16,
    color: '#7C6FAE',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 50,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1040',
    marginBottom: 20,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DEFF',
    padding: 16,
    borderRadius: 14,
    fontSize: 16,
  },

  inputErro: {
    borderColor: '#D64545',
  },

  erro: {
    color: '#D64545',
    fontSize: 14,
    marginTop: 8,
  },

  botao: {
    backgroundColor: '#6C4CFF',
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

});