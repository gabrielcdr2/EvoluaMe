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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { criarTarefa } from '../services/api';

const COLORS = {
  bg: '#0F0F0F',
  card: '#1A1A1A',
  cardBorder: '#2A2A2A',
  green: '#2FD98D',
  white: '#FFFFFF',
  gray: '#8A8A8E',
  input: '#1E1E1E',
  inputBorder: '#333333',
};

const XP_OPTIONS = [10, 25, 50, 100];

export default function NovaTarefaScreen() {
  const { token } = useAuth();
  const params = useLocalSearchParams<{ jornadaId: string; jornadaTitulo?: string }>();

  const jornadaId = params.jornadaId;
  const jornadaTitulo = params.jornadaTitulo ?? 'Jornada';

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [xpRecompensa, setXpRecompensa] = useState(25);
  const [loading, setLoading] = useState(false);

  const [tituloFocado, setTituloFocado] = useState(false);
  const [descFocada, setDescFocada] = useState(false);

  const podeCriar = titulo.trim().length > 0 && !loading;

  const handleCriar = async () => {
    if (!token) { Alert.alert('Erro', 'Você precisa estar logado.'); return; }
    if (!jornadaId) { Alert.alert('Erro', 'Jornada não identificada.'); return; }
    if (!titulo.trim()) { Alert.alert('Atenção', 'Dê um título para a tarefa.'); return; }

    try {
      setLoading(true);
      await criarTarefa(token, jornadaId, titulo.trim(), descricao.trim(), xpRecompensa);
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Não foi possível criar a tarefa.');
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
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Nova Tarefa</Text>
              <Text style={styles.headerSub} numberOfLines={1}>{jornadaTitulo}</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* ── Step 1: Título ── */}
          <View style={styles.section}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Título da Tarefa</Text>
            </View>

            <View style={[styles.inputWrapper, tituloFocado && styles.inputWrapperFocused]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={tituloFocado ? COLORS.green : COLORS.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Assistir videoaula, Correr 5km..."
                placeholderTextColor={COLORS.gray}
                value={titulo}
                onChangeText={setTitulo}
                onFocus={() => setTituloFocado(true)}
                onBlur={() => setTituloFocado(false)}
                maxLength={80}
                returnKeyType="next"
              />
            </View>
            <Text style={styles.charCount}>{titulo.length}/80</Text>
          </View>

          {/* ── Step 2: Descrição ── */}
          <View style={styles.section}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.stepLabel}>
                Descrição{' '}
                <Text style={styles.stepLabelOpcional}>(opcional)</Text>
              </Text>
            </View>

            <View style={[styles.inputWrapper, styles.inputWrapperMulti, descFocada && styles.inputWrapperFocused]}>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Descreva o que precisa ser feito..."
                placeholderTextColor={COLORS.gray}
                value={descricao}
                onChangeText={setDescricao}
                onFocus={() => setDescFocada(true)}
                onBlur={() => setDescFocada(false)}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>{descricao.length}/200</Text>
          </View>

          {/* ── Step 3: XP ── */}
          <View style={styles.section}>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Recompensa em XP</Text>
            </View>

            <View style={styles.xpGrid}>
              {XP_OPTIONS.map((xp) => {
                const selecionado = xpRecompensa === xp;
                return (
                  <TouchableOpacity
                    key={xp}
                    onPress={() => setXpRecompensa(xp)}
                    activeOpacity={0.8}
                    style={[styles.xpCard, selecionado && styles.xpCardSelected]}
                  >
                    {selecionado ? (
                      <LinearGradient
                        colors={[COLORS.green, '#0EA5E9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.xpCardGradient}
                      >
                        <Text style={styles.xpEmoji}>⭐</Text>
                        <Text style={styles.xpValorSelected}>+{xp}</Text>
                        <Text style={styles.xpLabelSelected}>XP</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.xpCardInner}>
                        <Text style={styles.xpEmoji}>⭐</Text>
                        <Text style={styles.xpValor}>+{xp}</Text>
                        <Text style={styles.xpLabel}>XP</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.xpInfoRow}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.gray} />
              <Text style={styles.xpInfo}>
                Você ganhará <Text style={{ color: COLORS.green, fontWeight: '700' }}>+{xpRecompensa} XP</Text> ao concluir esta tarefa
              </Text>
            </View>
          </View>

          {/* ── Botão criar ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleCriar}
              disabled={!podeCriar}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={podeCriar ? [COLORS.green, '#0EA5E9'] : ['#2A2A2A', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.criarBtn, !podeCriar && styles.criarBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.criarBtnText}>Adicionar Tarefa</Text>
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

  // ── Header ──────────────────────────────────────
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
    color: COLORS.green,
    marginTop: 2,
    fontWeight: '600',
  },

  // ── Steps ───────────────────────────────────────
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
  stepLabelOpcional: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.gray,
  },

  // ── Inputs ──────────────────────────────────────
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
  inputWrapperMulti: {
    alignItems: 'flex-start',
    paddingTop: 14,
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
  inputMulti: {
    minHeight: 72,
  },
  charCount: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'right',
    marginTop: 6,
  },

  // ── XP Grid ─────────────────────────────────────
  xpGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  xpCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  xpCardSelected: {
    borderColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  xpCardInner: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  xpCardGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  xpEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  xpValor: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
  },
  xpValorSelected: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
  },
  xpLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontWeight: '600',
  },
  xpLabelSelected: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  xpInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  xpInfo: {
    fontSize: 12,
    color: COLORS.gray,
    flex: 1,
  },

  // ── Footer ──────────────────────────────────────
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
