import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { criarJornada } from '../services/api';

type Categoria = 'Mental' | 'Físico';

const COLORS = {
  bg: '#0F0F0F',
  card: '#1A1A1A',
  cardBorder: '#2A2A2A',
  green: '#2FD98D',
  greenDark: '#0B2A20',
  purple: '#7C3AED',
  purpleDark: '#1E0845',
  purpleLight: '#A78BFA',
  blue: '#3B82F6',
  white: '#FFFFFF',
  gray: '#8A8A8E',
  grayLight: '#3A3A3A',
  input: '#1E1E1E',
  inputBorder: '#333333',
};

interface CategoriaCardProps {
  tipo: Categoria;
  selecionado: boolean;
  onPress: () => void;
}

function CategoriaCard({ tipo, selecionado, onPress }: CategoriaCardProps) {
  const isMental = tipo === 'Mental';

  const config = {
    Mental: {
      gradiente: ['#7C3AED', '#1E0845'] as [string, string],
      gradienteSelecionado: ['#9D5CF7', '#4C1D95'] as [string, string],
      icone: 'brain' as const,
      IconLib: MaterialCommunityIcons,
      descricao: 'Estudo, foco, meditação e desenvolvimento cognitivo',
      tag: '🧠 Mente',
      corTag: '#A78BFA',
      bgTag: 'rgba(124, 58, 237, 0.25)',
    },
    Físico: {
      gradiente: ['#0B2A20', '#064E3B'] as [string, string],
      gradienteSelecionado: ['#065F46', '#0B2A20'] as [string, string],
      icone: 'dumbbell' as const,
      IconLib: MaterialCommunityIcons,
      descricao: 'Treino, esporte, saúde e condicionamento físico',
      tag: '💪 Corpo',
      corTag: '#2FD98D',
      bgTag: 'rgba(47, 217, 141, 0.2)',
    },
  };

  const c = config[tipo];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.cardWrapper, selecionado && styles.cardWrapperSelected]}
    >
      <LinearGradient
        colors={selecionado ? c.gradienteSelecionado : c.gradiente}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.categoriaCard}
      >
        {/* Checkmark de seleção */}
        <View style={[styles.checkCircle, selecionado && styles.checkCircleActive]}>
          {selecionado && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>

        {/* Ícone central */}
        <View style={styles.iconCircle}>
          <c.IconLib
            name={c.icone}
            size={38}
            color={isMental ? '#A78BFA' : '#2FD98D'}
          />
        </View>

        {/* Nome */}
        <Text style={styles.cardTitle}>{tipo}</Text>

        {/* Descrição */}
        <Text style={styles.cardDesc}>{c.descricao}</Text>

        {/* Tag */}
        <View style={[styles.cardTag, { backgroundColor: c.bgTag }]}>
          <Text style={[styles.cardTagText, { color: c.corTag }]}>{c.tag}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function NovaJornadaScreen() {
  const { token } = useAuth();
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [nomeFocado, setNomeFocado] = useState(false);

  const podeCriar = nome.trim().length > 0 && categoria !== null && !loading;

  const handleCriar = async () => {
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado.');
      return;
    }
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Dê um nome para sua jornada.');
      return;
    }
    if (!categoria) {
      Alert.alert('Atenção', 'Selecione o tipo da jornada.');
      return;
    }

    try {
      setLoading(true);
      await criarJornada(token, nome.trim(), categoria);
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível criar a jornada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Nova Jornada</Text>
              <Text style={styles.headerSub}>Defina seu próximo desafio</Text>
            </View>

            {/* Espaço para balancear o header */}
            <View style={{ width: 40 }} />
          </View>

          {/* Step 1: Nome */}
          <View style={styles.section}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Nome da Jornada</Text>
            </View>

            <View style={[styles.inputWrapper, nomeFocado && styles.inputWrapperFocused]}>
              <Ionicons
                name="flag-outline"
                size={20}
                color={nomeFocado ? COLORS.green : COLORS.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Inglês Fluente, Corrida 5km..."
                placeholderTextColor={COLORS.gray}
                value={nome}
                onChangeText={setNome}
                onFocus={() => setNomeFocado(true)}
                onBlur={() => setNomeFocado(false)}
                maxLength={60}
                returnKeyType="done"
              />
            </View>
            <Text style={styles.charCount}>{nome.length}/60</Text>
          </View>

          {/* Step 2: Tipo */}
          <View style={styles.section}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Tipo da Jornada</Text>
            </View>

            <View style={styles.cardsRow}>
              <CategoriaCard
                tipo="Mental"
                selecionado={categoria === 'Mental'}
                onPress={() => setCategoria('Mental')}
              />
              <CategoriaCard
                tipo="Físico"
                selecionado={categoria === 'Físico'}
                onPress={() => setCategoria('Físico')}
              />
            </View>
          </View>

          {/* Botão criar */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleCriar}
              disabled={!podeCriar}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={
                  podeCriar
                    ? [COLORS.green, '#0EA5E9']
                    : ['#2A2A2A', '#1A1A1A']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.criarBtn, !podeCriar && styles.criarBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="rocket-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.criarBtnText}>Começar Jornada</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ─── Header ───────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },

  // ─── Seções ───────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  // ─── Input ────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapperFocused: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 6,
  },

  // ─── Cards de categoria ───────────────────────────
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardWrapperSelected: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  categoriaCard: {
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    minHeight: 200,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  checkCircleActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
  },
  cardTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ─── Footer / Botão ───────────────────────────────
  footer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  criarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  criarBtnDisabled: {
    opacity: 0.5,
  },
  criarBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
