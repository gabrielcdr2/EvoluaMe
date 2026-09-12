import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [nome, setNome] = useState('');
  const [nivel, setNivel] = useState(1);
  const [xp, setXp] = useState(0);

  // Carrega nome, nível e XP sempre que a Home recebe foco.
  // Isso é importante para atualizar o XP ao voltar de um desafio.
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  async function carregarDados() {
    try {
      const nomeSalvo = await AsyncStorage.getItem('@evolua_nome');
      const nivelSalvo = await AsyncStorage.getItem('@evolua_nivel');
      const xpSalvo = await AsyncStorage.getItem('@evolua_xp');

      if (nomeSalvo) {
        setNome(nomeSalvo);
      }

      if (nivelSalvo) {
        setNivel(Number(nivelSalvo));
      } else {
        setNivel(1);
      }

      if (xpSalvo) {
        setXp(Number(xpSalvo));
      } else {
        setXp(0);
      }
    } catch (error) {
      console.log('Erro ao carregar os dados:', error);
    }
  }

  function abrirArea(area: string) {
    router.push({
      pathname: '/atividades',
      params: { area },
    });
  }

  // A quantidade de XP necessária aumenta conforme o nível.
  const xpNecessario = nivel * 100;

  const progresso = Math.min(
    (xp / xpNecessario) * 100,
    100
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* LOGO */}

      <View style={styles.logoContainer}>
        <Text style={styles.logo}>
          Evolua
          <Text style={styles.logoDestaque}>.me</Text>
        </Text>
      </View>

      {/* SAUDAÇÃO */}

      <Text style={styles.saudacao}>
        Olá{nome ? `, ${nome}` : ''}! 👋
      </Text>

      <Text style={styles.titulo}>
        Onde você quer evoluir?
      </Text>

      {/* CARD DO PERSONAGEM */}

      <View style={styles.cardNivel}>
        <View style={styles.nivelTopo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          <View style={styles.informacoesNivel}>
            <Text style={styles.textoNivel}>
              NÍVEL {nivel}
            </Text>

            <Text style={styles.textoXP}>
              {xp} / {xpNecessario} XP
            </Text>
          </View>
        </View>

        {/* BARRA DE XP */}

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraXP,
              {
                width: `${progresso}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.porcentagem}>
          {Math.round(progresso)}% para o próximo nível
        </Text>
      </View>

      {/* ÁREAS */}

      <Text style={styles.subtitulo}>
        Escolha uma área para começar
      </Text>

      <View style={styles.listaAreas}>
        <TouchableOpacity
          style={styles.botaoArea}
          onPress={() => abrirArea('Estudos')}
          activeOpacity={0.8}
        >
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>📚</Text>
          </View>

          <View style={styles.textoAreaContainer}>
            <Text style={styles.nomeArea}>
              Estudos
            </Text>

            <Text style={styles.descricaoArea}>
              Evolua seus conhecimentos
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoArea}
          onPress={() => abrirArea('Atividade Física')}
          activeOpacity={0.8}
        >
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>🏃</Text>
          </View>

          <View style={styles.textoAreaContainer}>
            <Text style={styles.nomeArea}>
              Atividade Física
            </Text>

            <Text style={styles.descricaoArea}>
              Supere seus limites
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoArea}
          onPress={() => abrirArea('Leitura')}
          activeOpacity={0.8}
        >
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>📖</Text>
          </View>

          <View style={styles.textoAreaContainer}>
            <Text style={styles.nomeArea}>
              Leitura
            </Text>

            <Text style={styles.descricaoArea}>
              Crie o hábito de ler
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoArea}
          onPress={() => abrirArea('Línguas Estrangeiras')}
          activeOpacity={0.8}
        >
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>🌎</Text>
          </View>

          <View style={styles.textoAreaContainer}>
            <Text style={styles.nomeArea}>
              Línguas Estrangeiras
            </Text>

            <Text style={styles.descricaoArea}>
              Aprenda um novo idioma
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },

  conteudo: {
    padding: 24,
    paddingTop: 55,
    paddingBottom: 50,
  },

  logoContainer: {
    marginBottom: 35,
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1A1040',
  },

  logoDestaque: {
    color: '#6C4CFF',
  },

  saudacao: {
    fontSize: 16,
    color: '#7C6FAE',
    marginBottom: 5,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1040',
  },

  /* CARD DO NÍVEL */

  cardNivel: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginTop: 25,
    marginBottom: 30,

    borderWidth: 1,
    borderColor: '#E2DEFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  nivelTopo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EEEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarEmoji: {
    fontSize: 30,
  },

  informacoesNivel: {
    flex: 1,
  },

  textoNivel: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1A1040',
  },

  textoXP: {
    fontSize: 14,
    color: '#7C6FAE',
    marginTop: 4,
  },

  /* BARRA DE XP */

  barraFundo: {
    width: '100%',
    height: 12,
    backgroundColor: '#E8E5F5',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },

  barraXP: {
    height: '100%',
    backgroundColor: '#6C4CFF',
    borderRadius: 10,
  },

  porcentagem: {
    fontSize: 12,
    color: '#7C6FAE',
    marginTop: 8,
    textAlign: 'right',
  },

  /* ÁREAS */

  subtitulo: {
    fontSize: 16,
    color: '#7C6FAE',
    marginBottom: 15,
  },

  listaAreas: {
    gap: 12,
  },

  botaoArea: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 16,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#E7E3FF',
  },

  iconeContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0EDFF',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 15,
  },

  icone: {
    fontSize: 27,
  },

  textoAreaContainer: {
    flex: 1,
  },

  nomeArea: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A1040',
  },

  descricaoArea: {
    fontSize: 13,
    color: '#8C82B3',
    marginTop: 3,
  },

  seta: {
    fontSize: 28,
    color: '#6C4CFF',
  },
});