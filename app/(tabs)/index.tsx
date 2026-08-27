import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';

export default function App() {

  const [selecionado, setSelecionado] = useState('');

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.logo}>Evolua.me</Text>

      <Text style={styles.titulo}>
        Onde você quer evoluir?
      </Text>

      <Text style={styles.subtitulo}>
        Escolha uma área para começar
      </Text>

      <View style={styles.opcoes}>

        <TouchableOpacity
          style={selecionado === 'Estudos' ? styles.opcaoSelecionada : styles.opcao}
          onPress={() => setSelecionado('Estudos')}
        >
          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.texto}>Estudos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selecionado === 'Atividade Física' ? styles.opcaoSelecionada : styles.opcao}
          onPress={() => setSelecionado('Atividade Física')}
        >
          <Text style={styles.emoji}>🏃</Text>
          <Text style={styles.texto}>Atividade Física</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selecionado === 'Leitura' ? styles.opcaoSelecionada : styles.opcao}
          onPress={() => setSelecionado('Leitura')}
        >
          <Text style={styles.emoji}>📖</Text>
          <Text style={styles.texto}>Leitura</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={selecionado === 'Línguas Estrangeiras' ? styles.opcaoSelecionada : styles.opcao}
          onPress={() => setSelecionado('Línguas Estrangeiras')}
        >
          <Text style={styles.emoji}>🌎</Text>
          <Text style={styles.texto}>Línguas Estrangeiras</Text>
        </TouchableOpacity>


      </View>

      {selecionado !== '' && (
        <Text style={styles.escolha}>
          Você escolheu: {selecionado}
        </Text>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    position: 'relative',
  },

  sairBotao: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#f0eeff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  sairTexto: {
    fontSize: 12,
    color: '#6c4cff',
    fontWeight: '600',
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#6c4cff',
    textAlign: 'center',
    marginTop: 30
  },

  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40
  },

  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30
  },

  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  opcao: {
    width: '48%',
    height: 130,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },

  opcaoSelecionada: {
    width: '48%',
    height: 130,
    backgroundColor: '#e5ddff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#6c4cff'
  },

  emoji: {
    fontSize: 35,
    marginBottom: 10
  },

  texto: {
    fontSize: 15,
    fontWeight: 'bold'
  },

  escolha: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6c4cff',
    fontWeight: 'bold'
  }

});