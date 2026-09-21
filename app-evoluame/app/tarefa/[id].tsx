import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { useAuth, salvarSessao } from '../../hooks/useAuth';
import { buscarTarefa, buscarFeedbacksEvo, concluirTarefa, Tarefa, FeedbackEvo } from '../../services/api';

const COLORS = {
  bg: '#0F0F0F',
  card: '#1A1A1A',
  cardBorder: '#2A2A2A',
  green: '#2FD98D',
  greenDim: 'rgba(47,217,141,0.15)',
  red: '#FF453A',
  redDim: 'rgba(255,69,58,0.15)',
  white: '#FFFFFF',
  gray: '#8A8A8E',
  input: '#1E1E1E',
  inputBorder: '#333333',
};

export default function TarefaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, usuario } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'submissao' | 'feedbacks'>('submissao');
  
  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackEvo[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // States para a submissão
  const [descricaoUsuario, setDescricaoUsuario] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDados = useCallback(async () => {
    if (!token || !id) return;
    try {
      const [t, f] = await Promise.all([
        buscarTarefa(token, id),
        buscarFeedbacksEvo(token, id)
      ]);
      setTarefa(t);
      setFeedbacks(f);
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da tarefa.');
    } finally {
      setLoadingInitial(false);
    }
  }, [token, id]);

  useFocusEffect(
    useCallback(() => {
      fetchDados();
    }, [fetchDados])
  );

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Atenção', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImagemUri(uri);
      
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
        setImagemBase64(`data:${mimeType};base64,${base64}`);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível processar a imagem.');
      }
    }
  };

  const handleRemoverImagem = () => {
    setImagemUri(null);
    setImagemBase64(null);
  };

  const handleSubmit = async () => {
    if (!token || !usuario || !tarefa) return;
    
    if (!descricaoUsuario.trim()) {
      Alert.alert('Atenção', 'Você precisa descrever o que fez para o Evo avaliar.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await concluirTarefa(token, tarefa._id, descricaoUsuario.trim(), imagemBase64 || undefined);
      
      // Sucesso! Tarefa aprovada
      setTarefa(res.tarefa);
      if (res.feedbacks) setFeedbacks(res.feedbacks);
      
      // Atualiza sessão
      await salvarSessao(token, {
        ...usuario,
        xpTotal: res.novoXpTotal,
        nivelGlobal: res.novoNivel,
      });

      Alert.alert('Aprovado!', res.mensagem);
      setDescricaoUsuario('');
      handleRemoverImagem();
      setActiveTab('feedbacks');

    } catch (error: any) {
      // Reprovado ou erro
      Alert.alert('Ops!', error.message || 'Erro ao avaliar submissão.');
      fetchDados(); // Atualiza a lista de feedbacks para pegar a reprovação
      setActiveTab('feedbacks');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  if (!tarefa) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Detalhes da Tarefa</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Info principal da tarefa ── */}
      <View style={styles.taskInfoContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.taskTitle}>{tarefa.titulo}</Text>
            {tarefa.descricao && (
              <Text style={styles.taskDesc}>{tarefa.descricao}</Text>
            )}
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{tarefa.xpRecompensa} XP</Text>
          </View>
        </View>

        {tarefa.status === 'Concluída' && (
          <View style={styles.concluidaAlert}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
            <Text style={styles.concluidaAlertText}>Tarefa Concluída com Sucesso!</Text>
          </View>
        )}
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'submissao' && styles.tabActive]}
          onPress={() => setActiveTab('submissao')}
        >
          <Text style={[styles.tabText, activeTab === 'submissao' && styles.tabTextActive]}>Submissão</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'feedbacks' && styles.tabActive]}
          onPress={() => setActiveTab('feedbacks')}
        >
          <Text style={[styles.tabText, activeTab === 'feedbacks' && styles.tabTextActive]}>
            Feedbacks ({feedbacks.length})
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* TAB SUBMISSAO */}
          {activeTab === 'submissao' && (
            <View style={styles.tabContent}>
              {tarefa.status === 'Concluída' ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="trophy-outline" size={40} color={COLORS.green} />
                  <Text style={styles.emptyText}>Você já concluiu esta tarefa!</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.label}>O que você fez?</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.inputMulti}
                      placeholder="Descreva sua experiência para o Evo avaliar..."
                      placeholderTextColor={COLORS.gray}
                      value={descricaoUsuario}
                      onChangeText={setDescricaoUsuario}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 20 }]}>Anexo (Foto)</Text>
                  {imagemUri ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image source={{ uri: imagemUri }} style={styles.imagePreview} />
                      <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoverImagem}>
                        <Ionicons name="close-circle" size={24} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                      <Ionicons name="image-outline" size={24} color={COLORS.green} />
                      <Text style={styles.attachBtnText}>Carregar imagem da galeria</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting || !descricaoUsuario.trim()}
                    style={{ marginTop: 30 }}
                  >
                    <LinearGradient
                      colors={(!submitting && descricaoUsuario.trim()) ? [COLORS.green, '#0EA5E9'] : ['#2A2A2A', '#1A1A1A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitBtn}
                    >
                      {submitting ? (
                        <>
                          <ActivityIndicator color="#fff" size="small" style={{ marginRight: 10 }} />
                          <Text style={styles.submitBtnText}>Evo está analisando...</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="hardware-chip-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.submitBtnText}>Enviar para o Evo</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    O Evo é rigoroso! Capriche na descrição e nas fotos para provar que a tarefa foi feita.
                  </Text>
                </>
              )}
            </View>
          )}

          {/* TAB FEEDBACKS */}
          {activeTab === 'feedbacks' && (
            <View style={styles.tabContent}>
              {feedbacks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color={COLORS.gray} />
                  <Text style={styles.emptyText}>Nenhum feedback ainda.</Text>
                </View>
              ) : (
                feedbacks.map((fb) => (
                  <View key={fb._id} style={[styles.feedbackCard, fb.aprovado ? styles.fbCardAprovado : styles.fbCardReprovado]}>
                    <View style={styles.fbHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons 
                          name={fb.aprovado ? "checkmark-circle" : "close-circle"} 
                          size={18} 
                          color={fb.aprovado ? COLORS.green : COLORS.red} 
                        />
                        <Text style={[styles.fbStatusText, { color: fb.aprovado ? COLORS.green : COLORS.red }]}>
                          {fb.aprovado ? 'Aprovado' : 'Reprovado'}
                        </Text>
                      </View>
                      <Text style={styles.fbDate}>{new Date(fb.createdAt).toLocaleDateString('pt-BR')}</Text>
                    </View>

                    <Text style={styles.fbDescUsuario}>Você enviou: "{fb.descricaoEnviada}"</Text>

                    <View style={styles.fbMentorBox}>
                      <Ionicons name="hardware-chip" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                      <Text style={styles.fbMentorText}>{fb.mensagemMentor}</Text>
                    </View>

                    {!fb.aprovado && fb.motivoReprovacao ? (
                      <Text style={styles.fbMotivo}>Motivo: {fb.motivoReprovacao}</Text>
                    ) : null}

                    {fb.xpExtra > 0 && (
                      <Text style={styles.fbXpExtra}>+{fb.xpExtra} XP Bônus do Evo!</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  
  taskInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
  },
  taskDesc: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  xpBadge: {
    backgroundColor: COLORS.greenDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpBadgeText: {
    color: COLORS.green,
    fontWeight: '800',
    fontSize: 12,
  },
  concluidaAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenDim,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  concluidaAlertText: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 14,
  },

  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.green,
  },
  tabText: {
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.green,
  },

  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContent: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
  },

  label: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: COLORS.input,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: 16,
  },
  inputMulti: {
    color: COLORS.white,
    minHeight: 100,
    fontSize: 15,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 24,
    gap: 10,
  },
  attachBtnText: {
    color: COLORS.gray,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  helperText: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },

  // FEEDBACKS
  feedbackCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  fbCardAprovado: {
    borderColor: 'rgba(47,217,141,0.3)',
  },
  fbCardReprovado: {
    borderColor: 'rgba(255,69,58,0.3)',
  },
  fbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fbStatusText: {
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  fbDate: {
    color: COLORS.gray,
    fontSize: 12,
  },
  fbDescUsuario: {
    color: COLORS.gray,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  fbMentorBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  fbMentorText: {
    color: COLORS.white,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  fbMotivo: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 12,
    fontWeight: '500',
  },
  fbXpExtra: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 10,
  }
});
