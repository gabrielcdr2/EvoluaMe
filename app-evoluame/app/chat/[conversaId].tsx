import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useAcessibilidade } from "../../contexts/AcessibilidadeContext";
import { useAuth } from "../../hooks/useAuth";

const VERDE = "#2FD98D";
const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://evoluame.onrender.com";

type Mensagem = {
  id: string;
  conversa_id: string;
  remetente_id: string;
  conteudo: string;
  criada_em: string;
};

export default function TelaChat() {
  const { conversaId, amigoNome } = useLocalSearchParams<{
    conversaId: string;
    amigoNome?: string;
  }>();
  const { token, usuario } = useAuth();
  const { tema, tamanhoFonte } = useAcessibilidade();
  const escuro = tema === "dark";
  const fundo = escuro ? "#131313" : "#FFFFFF";
  const card = escuro ? "#212124" : "#F4F4F5";
  const texto = escuro ? "#FFFFFF" : "#161616";
  const secundario = escuro ? "#B0B0B5" : "#8A8A8E";
  const borda = escuro ? "#38383C" : "#DDDDDD";

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const listaRef = useRef<FlatList<Mensagem>>(null);

  const carregarMensagens = useCallback(async () => {
    if (!token || !conversaId) {
      setCarregando(false);
      setErro("Conversa ou autenticação indisponível.");
      return;
    }
    setErro("");
    try {
      const resposta = await fetch(
        `${BASE_URL}/api/chat/conversas/${encodeURIComponent(conversaId)}/mensagens`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.erro ?? "Não foi possível carregar as mensagens.");
      }
      setMensagens(dados.mensagens ?? []);
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao carregar as mensagens.");
    } finally {
      setCarregando(false);
    }
  }, [conversaId, token]);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      void carregarMensagens();
    }, [carregarMensagens]),
  );

  async function enviarMensagem() {
    const conteudo = rascunho.trim();
    if (!token || !conversaId || !conteudo || enviando) return;
    if (conteudo.length > 2000) {
      Alert.alert("Mensagem muito longa", "O limite é de 2.000 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await fetch(
        `${BASE_URL}/api/chat/conversas/${encodeURIComponent(conversaId)}/mensagens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ conteudo }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok) {
        throw new Error(dados.erro ?? "Não foi possível enviar a mensagem.");
      }
      setRascunho("");
      await carregarMensagens();
    } catch (e: any) {
      Alert.alert("Erro ao enviar", e?.message ?? "Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: fundo }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { borderBottomColor: borda }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={26} color={texto} />
        </TouchableOpacity>
        <Ionicons name="person-circle-outline" size={36} color={VERDE} />
        <View style={styles.nomeArea}>
          <Text style={{ color: texto, fontSize: 18 * tamanhoFonte, fontWeight: "700" }} numberOfLines={1}>
            {amigoNome || "Conversa"}
          </Text>
          <Text style={{ color: secundario, fontSize: 12 * tamanhoFonte }}>
            Chat privado
          </Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.centro}><ActivityIndicator color={VERDE} /></View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={{ color: texto, textAlign: "center" }}>{erro}</Text>
          <TouchableOpacity onPress={() => void carregarMensagens()} style={styles.tentar}>
            <Text style={styles.tentarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={listaRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={{ color: secundario, textAlign: "center", marginTop: 28 }}>
              Nenhuma mensagem ainda. Comece a conversa!
            </Text>
          }
          renderItem={({ item }) => {
            const minha = item.remetente_id === usuario?.id;
            return (
              <View style={[styles.balao, { backgroundColor: minha ? VERDE : card, alignSelf: minha ? "flex-end" : "flex-start" }]}>
                <Text style={{ color: minha ? "#161616" : texto, fontSize: 14 * tamanhoFonte }}>
                  {item.conteudo}
                </Text>
                <Text style={{ color: minha ? "#345445" : secundario, fontSize: 10 * tamanhoFonte, alignSelf: "flex-end", marginTop: 5 }}>
                  {new Date(item.criada_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          }}
        />
      )}

      <View style={[styles.rodape, { borderTopColor: borda, backgroundColor: fundo }]}>
        <TextInput
          style={[styles.campo, { color: texto, backgroundColor: card, fontSize: 14 * tamanhoFonte }]}
          value={rascunho}
          onChangeText={setRascunho}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={secundario}
          multiline
          maxLength={2000}
          editable={!enviando && !carregando && !erro}
          accessibilityLabel="Mensagem"
        />
        <TouchableOpacity
          style={[styles.enviar, (!rascunho.trim() || enviando || carregando || !!erro) && styles.desabilitado]}
          onPress={() => void enviarMensagem()}
          disabled={!rascunho.trim() || enviando || carregando || !!erro}
          accessibilityLabel="Enviar mensagem"
        >
          {enviando ? <ActivityIndicator color="#161616" /> : <Ionicons name="send" size={20} color="#161616" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 54, paddingBottom: 14, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1 },
  nomeArea: { flex: 1 },
  centro: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  tentar: { backgroundColor: VERDE, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, marginTop: 14 },
  tentarTexto: { color: "#161616", fontWeight: "700" },
  lista: { paddingHorizontal: 16, paddingVertical: 18, flexGrow: 1 },
  balao: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, maxWidth: "82%", marginBottom: 10 },
  rodape: { flexDirection: "row", alignItems: "flex-end", padding: 12, gap: 10, borderTopWidth: 1 },
  campo: { flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 11, maxHeight: 110 },
  enviar: { backgroundColor: VERDE, borderRadius: 22, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  desabilitado: { opacity: 0.5 },
});
