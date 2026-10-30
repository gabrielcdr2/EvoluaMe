
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAcessibilidade } from "../contexts/AcessibilidadeContext";
import { useAuth } from "../hooks/useAuth";

import {
  UsuarioAmigo,
  SolicitacaoAmizade,
  Amizade,
  buscarUsuarioAmigo,
  solicitarAmizade,
  buscarSolicitacoesAmizade,
  aceitarSolicitacaoAmizade,
  recusarSolicitacaoAmizade,
  listarAmigos,
} from "../services/amizades";

const VERDE = "#2FD98D";

export default function AmigosScreen() {
  const { tema, tamanhoFonte } = useAcessibilidade();
  const { token, usuario } = useAuth();

  const escuro = tema === "dark";

  const fundo = escuro ? "#131313" : "#FFFFFF";
  const card = escuro ? "#212124" : "#F4F4F5";
  const texto = escuro ? "#FFFFFF" : "#161616";
  const secundario = escuro ? "#B0B0B5" : "#8A8A8E";
  const borda = escuro ? "#38383C" : "#DDDDDD";

  const [email, setEmail] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] =
    useState<UsuarioAmigo | null>(null);

  const [solicitacoes, setSolicitacoes] =
    useState<SolicitacaoAmizade[]>([]);

  const [amigos, setAmigos] = useState<Amizade[]>([]);

  const [buscando, setBuscando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [erroCarregamento, setErroCarregamento] = useState("");

  const carregarDados = useCallback(async () => {
    if (!token) return;

    setErroCarregamento("");

    try {
      const [novasSolicitacoes, novosAmigos] = await Promise.all([
        buscarSolicitacoesAmizade(token),
        listarAmigos(token),
      ]);

      setSolicitacoes(novasSolicitacoes);
      setAmigos(novosAmigos);
    } catch (erro: any) {
      setErroCarregamento(
        erro?.message ?? "Não foi possível carregar suas amizades.",
      );
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (!token) return;

      let ativo = true;

      async function iniciar() {
        setCarregando(true);

        try {
          await carregarDados();
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      iniciar();

      return () => {
        ativo = false;
      };
    }, [token, carregarDados]),
  );

  async function atualizar() {
    setAtualizando(true);

    try {
      await carregarDados();
    } finally {
      setAtualizando(false);
    }
  }

  async function buscar() {
    const emailLimpo = email.trim();

    if (!emailLimpo) {
      Alert.alert("Atenção", "Digite o e-mail do seu amigo.");
      return;
    }

    if (!token) {
      Alert.alert("Atenção", "Você precisa estar conectado.");
      return;
    }

    setBuscando(true);
    setUsuarioEncontrado(null);

    try {
      const resultado = await buscarUsuarioAmigo(token, emailLimpo);
      setUsuarioEncontrado(resultado);
    } catch (erro: any) {
      Alert.alert(
        "Busca de amigos",
        erro?.message ?? "Não foi possível buscar o usuário.",
      );
    } finally {
      setBuscando(false);
    }
  }

  async function enviarSolicitacao() {
    if (!token || !usuarioEncontrado || enviando) return;

    setEnviando(true);

    try {
      await solicitarAmizade(token, usuarioEncontrado.email);

      Alert.alert(
        "Solicitação enviada!",
        `Seu convite para ${usuarioEncontrado.nome} foi enviado.`,
      );

      setUsuarioEncontrado(null);
      setEmail("");
    } catch (erro: any) {
      Alert.alert(
        "Não foi possível enviar",
        erro?.message ?? "Tente novamente.",
      );
    } finally {
      setEnviando(false);
    }
  }

  async function responderSolicitacao(
    id: string,
    acao: "aceitar" | "recusar",
  ) {
    if (!token || processandoId) return;

    setProcessandoId(id);

    try {
      if (acao === "aceitar") {
        await aceitarSolicitacaoAmizade(token, id);
      } else {
        await recusarSolicitacaoAmizade(token, id);
      }

      await carregarDados();

      Alert.alert(
        "Pronto!",
        acao === "aceitar"
          ? "Solicitação aceita com sucesso!"
          : "Solicitação recusada.",
      );
    } catch (erro: any) {
      Alert.alert(
        "Erro",
        erro?.message ?? "Não foi possível responder à solicitação.",
      );
    } finally {
      setProcessandoId(null);
    }
  }

function obterOutroUsuario(amizade: Amizade): UsuarioAmigo {
  return amizade.usuario;
}

  return (
    <View style={[styles.container, { backgroundColor: fundo }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={26} color={texto} />
        </TouchableOpacity>

        <Text
          style={[
            styles.titulo,
            { color: texto, fontSize: 22 * tamanhoFonte },
          ]}
        >
          Amigos
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={atualizar}
            tintColor={VERDE}
            colors={[VERDE]}
          />
        }
      >
        <Text
          style={[
            styles.subtitulo,
            { color: secundario, fontSize: 14 * tamanhoFonte },
          ]}
        >
          Evoluir é ainda melhor com amigos!
        </Text>

        {/* Busca de amigos */}
        <View style={[styles.card, { backgroundColor: card }]}>
          <Text
            style={[
              styles.cardTitulo,
              { color: texto, fontSize: 17 * tamanhoFonte },
            ]}
          >
            Adicionar amigo
          </Text>

          <Text
            style={[
              styles.descricao,
              { color: secundario, fontSize: 13 * tamanhoFonte },
            ]}
          >
            Encontre alguém pelo e-mail cadastrado no EvoluaMe.
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: texto,
                borderColor: borda,
                fontSize: 14 * tamanhoFonte,
              },
            ]}
            placeholder="E-mail do amigo"
            placeholderTextColor={secundario}
            value={email}
            onChangeText={(valor) => {
              setEmail(valor);
              setUsuarioEncontrado(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="E-mail do amigo"
          />

          <TouchableOpacity
            style={[styles.botao, buscando && styles.desabilitado]}
            onPress={buscar}
            disabled={buscando}
            accessibilityRole="button"
          >
            {buscando ? (
              <ActivityIndicator color="#161616" />
            ) : (
              <>
                <Ionicons name="search" size={19} color="#161616" />
                <Text
                  style={[
                    styles.botaoTexto,
                    { fontSize: 14 * tamanhoFonte },
                  ]}
                >
                  Buscar amigo
                </Text>
              </>
            )}
          </TouchableOpacity>

          {usuarioEncontrado && (
            <View style={[styles.resultado, { borderColor: borda }]}>
              <View style={styles.usuarioInfo}>
                <Ionicons
                  name="person-circle-outline"
                  size={38}
                  color={VERDE}
                />

                <View style={styles.usuarioTextos}>
                  <Text
                    style={{
                      color: texto,
                      fontWeight: "700",
                      fontSize: 14 * tamanhoFonte,
                    }}
                  >
                    {usuarioEncontrado.nome}
                  </Text>

                  <Text
                    style={{
                      color: secundario,
                      fontSize: 12 * tamanhoFonte,
                    }}
                  >
                    {usuarioEncontrado.email}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.botao, enviando && styles.desabilitado]}
                onPress={enviarSolicitacao}
                disabled={enviando}
                accessibilityRole="button"
              >
                {enviando ? (
                  <ActivityIndicator color="#161616" />
                ) : (
                  <>
                    <Ionicons
                      name="person-add-outline"
                      size={18}
                      color="#161616"
                    />
                    <Text style={styles.botaoTexto}>
                      Enviar solicitação
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Solicitações recebidas */}
        <View style={styles.secao}>
          <Text
            style={[
              styles.secaoTitulo,
              { color: texto, fontSize: 18 * tamanhoFonte },
            ]}
          >
            Solicitações recebidas
          </Text>

          {carregando ? (
            <ActivityIndicator color={VERDE} />
          ) : solicitacoes.length === 0 ? (
            <View style={[styles.vazio, { backgroundColor: card }]}>
              <Ionicons name="mail-outline" size={30} color={VERDE} />
              <Text
                style={[
                  styles.vazioTexto,
                  { color: secundario, fontSize: 13 * tamanhoFonte },
                ]}
              >
                Nenhuma solicitação recebida.
              </Text>
            </View>
          ) : (
            solicitacoes.map((solicitacao) => (
              <View
                key={solicitacao._id}
                style={[styles.pessoaCard, { backgroundColor: card }]}
              >
                <View style={styles.usuarioInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={VERDE}
                  />

                  <View style={styles.usuarioTextos}>
                    <Text
                      style={{
                        color: texto,
                        fontWeight: "700",
                        fontSize: 14 * tamanhoFonte,
                      }}
                    >
                      {solicitacao.solicitante.nome}
                    </Text>

                    <Text
                      style={{
                        color: secundario,
                        fontSize: 12 * tamanhoFonte,
                      }}
                    >
                      {solicitacao.solicitante.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.acoes}>
                  <TouchableOpacity
                    style={styles.aceitar}
                    disabled={processandoId !== null}
                    onPress={() =>
                      responderSolicitacao(solicitacao._id, "aceitar")
                    }
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#161616"
                    />
                    <Text style={styles.acaoTexto}>Aceitar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.recusar, { borderColor: borda }]}
                    disabled={processandoId !== null}
                    onPress={() =>
                      responderSolicitacao(solicitacao._id, "recusar")
                    }
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={18} color={texto} />
                    <Text style={[styles.acaoTexto, { color: texto }]}>
                      Recusar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Lista de amigos */}
        <View style={styles.secao}>
          <Text
            style={[
              styles.secaoTitulo,
              { color: texto, fontSize: 18 * tamanhoFonte },
            ]}
          >
            Meus amigos
          </Text>

          {carregando ? (
            <ActivityIndicator color={VERDE} />
          ) : amigos.length === 0 ? (
            <View style={[styles.vazio, { backgroundColor: card }]}>
              <Ionicons name="people-outline" size={32} color={VERDE} />
              <Text
                style={[
                  styles.vazioTexto,
                  { color: secundario, fontSize: 13 * tamanhoFonte },
                ]}
              >
                Sua lista de amigos aparecerá aqui.
              </Text>
            </View>
          ) : (
            amigos.map((amizade) => {
              const amigo = obterOutroUsuario(amizade);

              return (
                <View
                  key={amizade.amizadeId}
                  style={[styles.pessoaCard, { backgroundColor: card }]}
                >
                  <View style={styles.usuarioInfo}>
                    <Ionicons
                      name="person-circle-outline"
                      size={40}
                      color={VERDE}
                    />

                    <View style={styles.usuarioTextos}>
                      <Text
                        style={{
                          color: texto,
                          fontWeight: "700",
                          fontSize: 14 * tamanhoFonte,
                        }}
                      >
                        {amigo.nome}
                      </Text>

                      <Text
                        style={{
                          color: secundario,
                          fontSize: 12 * tamanhoFonte,
                        }}
                      >
                        {amigo.email}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {erroCarregamento !== "" && (
          <Text
            style={[
              styles.erro,
              { fontSize: 12 * tamanhoFonte },
            ]}
          >
            {erroCarregamento}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 20,
  },
  titulo: {
    fontWeight: "800",
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  subtitulo: {
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  cardTitulo: {
    fontWeight: "700",
    marginBottom: 8,
  },
  descricao: {
    lineHeight: 21,
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  botao: {
    backgroundColor: VERDE,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  botaoTexto: {
    fontWeight: "700",
    color: "#161616",
  },
  desabilitado: {
    opacity: 0.6,
  },
  resultado: {
    marginTop: 18,
    borderTopWidth: 1,
    paddingTop: 18,
  },
  usuarioInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  usuarioTextos: {
    flex: 1,
  },
  secao: {
    marginTop: 28,
  },
  secaoTitulo: {
    fontWeight: "700",
    marginBottom: 14,
  },
  vazio: {
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  vazioTexto: {
    textAlign: "center",
  },
  pessoaCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    gap: 16,
  },
  acoes: {
    flexDirection: "row",
    gap: 10,
  },
  aceitar: {
    flex: 1,
    backgroundColor: VERDE,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  recusar: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  acaoTexto: {
    fontWeight: "700",
    fontSize: 13,
  },
  erro: {
    color: "#F87171",
    textAlign: "center",
    marginTop: 24,
  },
});
