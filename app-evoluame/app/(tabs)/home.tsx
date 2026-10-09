import React, { useCallback, useRef, useState } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import Ionicons from "@expo/vector-icons/Ionicons";

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { router, useFocusEffect } from "expo-router";

import { useAcessibilidade } from "../../contexts/AcessibilidadeContext";

import CircularProgress from "../../components/CircularProgress";

import TaskItem from "../../components/TaskItem";

import { useAuth } from "../../hooks/useAuth";

import { salvarSessao } from "../../hooks/useAuth";

import {
  buscarJornadaAtiva,
  concluirTarefa,
  Jornada,
  Tarefa,
} from "../../services/api";

// ---------- Cores ----------

const COLORS = {
  bgLight: "#FFFFFF",

  bgDark: "#131313",

  cardLight: "#F4F4F5",

  cardDark: "#212124",

  green: "#2FD98D",

  greenDark: "#0B2A20",

  purpleTrack: "#E3DFF7",

  gold: "#F5C518",

  textDark: "#161616",

  textGray: "#8A8A8E",

  textWhite: "#FFFFFF",

  textWhiteMuted: "rgba(255,255,255,0.65)",
};

export default function HomeScreen() {
  const { usuario, token, carregando: carregandoAuth } = useAuth();

  const { tema, tamanhoFonte } = useAcessibilidade();

  const escuro = tema === "dark";

  const paleta = {
    fundo: escuro ? "#131313" : "#FFFFFF",

    card: escuro ? "#212124" : "#F4F4F5",

    texto: escuro ? "#FFFFFF" : "#161616",

    secundario: escuro ? "#B0B0B5" : "#8A8A8E",

    divisoria: escuro ? "#38383C" : "#E8E8E8",

    // A seção de jornadas continua escura nos dois temas.

    jornadas: "#131313",
  };

  const [jornada, setJornada] = useState<Jornada | null>(null);

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  const [carregandoJornada, setCarregandoJornada] = useState(false);

  const [toast, setToast] = useState<{ mensagem: string; visivel: boolean }>({
    mensagem: "",

    visivel: false,
  });

  const toastAnim = React.useRef(new Animated.Value(0)).current;

  const nivel = usuario?.nivelGlobal ?? 1;

  const xp = usuario?.xpTotal ?? 0;

  const xpNecessario = nivel * 100;

  const progressoXP = Math.min((xp / xpNecessario) * 100, 100);

  // Calcula progresso da jornada com base nas tarefas

  const totalTarefas = tarefas.length;

  const tarefasConcluidas = tarefas.filter(
    (t) => t.status === "Concluída",
  ).length;

  const progressoJornada =
    totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

  // Carrega jornada ativa toda vez que a Home recebe foco

  useFocusEffect(
    useCallback(() => {
      if (!token) return;

      carregarJornada();
    }, [token]),
  );

  async function carregarJornada() {
    try {
      setCarregandoJornada(true);

      const dados = await buscarJornadaAtiva(token!);

      setJornada(dados.jornada);

      setTarefas(dados.tarefas);
    } catch (error) {
      console.log("Erro ao carregar jornada:", error);
    } finally {
      setCarregandoJornada(false);
    }
  }

  function mostrarToast(mensagem: string) {
    setToast({ mensagem, visivel: true });

    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,

        duration: 300,

        useNativeDriver: true,
      }),

      Animated.delay(2200),

      Animated.timing(toastAnim, {
        toValue: 0,

        duration: 300,

        useNativeDriver: true,
      }),
    ]).start(() => setToast({ mensagem: "", visivel: false }));
  }

  async function handleConcluirTarefa(tarefaId: string) {
    if (!token || !usuario) return;

    try {
      const resultado = await concluirTarefa(token, tarefaId);

      // Atualiza a tarefa localmente (mostra como concluída imediatamente)

      setTarefas((prev) =>
        prev.map((t) =>
          t._id === tarefaId
            ? {
                ...t,

                status: "Concluída" as const,

                dataConclusao: new Date().toISOString(),
              }
            : t,
        ),
      );

      // Atualiza a sessão local com o novo XP e nível

      await salvarSessao(token, {
        ...usuario,

        xpTotal: resultado.novoXpTotal,

        nivelGlobal: resultado.novoNivel,
      });

      mostrarToast(resultado.mensagem);
    } catch (error: any) {
      mostrarToast(error.message ?? "Erro ao concluir tarefa");
    }
  }

  // Formata a data de criação da jornada

  function formatarData(iso: string) {
    const d = new Date(iso);

    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  }

  if (carregandoAuth) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: paleta.fundo }]}
      >
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeAreaTop, { backgroundColor: paleta.jornadas }]}
    >
      <StatusBar barStyle={escuro ? "light-content" : "dark-content"} />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* ---------- Cabeçalho (fundo claro) ---------- */}

        <View style={[styles.header, { backgroundColor: paleta.fundo }]}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
              accessible={false}
            />

            <View style={{ marginLeft: 12 }}>
              <Text
                style={[
                  styles.welcomeText,

                  { fontSize: 13 * tamanhoFonte, color: paleta.secundario },
                ]}
              >
                Bem vindo(a),
              </Text>

              <Text
                style={[
                  styles.userName,

                  { fontSize: 18 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                {usuario?.nome || "Jogador"}
              </Text>

              <View style={styles.badge}>
                <Text
                  style={[styles.badgeText, { fontSize: 10 * tamanhoFonte }]}
                >
                  NÍVEL {nivel}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: paleta.divisoria }]}
          />

          <Text
            accessibilityRole="header"
            style={[
              styles.sectionTitleDark,

              { fontSize: 16 * tamanhoFonte, color: paleta.texto },
            ]}
          >
            Visão geral
          </Text>

          <View style={styles.overviewRow}>
            <View
              style={[styles.overviewCard, { backgroundColor: paleta.card }]}
              accessible
              accessibilityLabel={`XP total: ${xp} pontos acumulados`}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={paleta.texto}
              />

              <Text
                style={[
                  styles.overviewNumber,

                  { fontSize: 20 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                {xp}
              </Text>

              <Text
                style={[
                  styles.overviewLabel,

                  { fontSize: 11 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                XP Total
              </Text>

              <Text
                style={[
                  styles.overviewSubLabel,

                  { fontSize: 10 * tamanhoFonte, color: paleta.secundario },
                ]}
              >
                Acumulado
              </Text>
            </View>

            <View
              style={[styles.overviewCard, { backgroundColor: paleta.card }]}
              accessible
              accessibilityLabel={`Progresso para o próximo nível: ${Math.round(progressoXP)} por cento`}
            >
              <CircularProgress
                size={44}
                strokeWidth={5}
                progress={progressoXP}
                trackColor={COLORS.purpleTrack}
                progressColor={COLORS.green}
              >
                <Text
                  style={[
                    styles.overviewPercent,

                    { fontSize: 13 * tamanhoFonte, color: paleta.texto },
                  ]}
                >
                  {Math.round(progressoXP)}%
                </Text>
              </CircularProgress>

              <Text
                style={[
                  styles.overviewLabel,

                  { marginTop: 8 },

                  { fontSize: 11 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                Progresso
              </Text>

              <Text
                style={[
                  styles.overviewSubLabel,

                  { fontSize: 10 * tamanhoFonte, color: paleta.secundario },
                ]}
              >
                Próx. nível
              </Text>
            </View>

            <View
              style={[styles.overviewCard, { backgroundColor: paleta.card }]}
              accessible
              accessibilityLabel={`Nível atual: ${nivel}`}
            >
              <FontAwesome5 name="medal" size={22} color={COLORS.gold} />

              <Text
                style={[
                  styles.overviewNumber,

                  { fontSize: 20 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                {nivel}
              </Text>

              <Text
                style={[
                  styles.overviewLabel,

                  { fontSize: 11 * tamanhoFonte, color: paleta.texto },
                ]}
              >
                Nível atual
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Corpo (fundo escuro) ---------- */}

        <View style={[styles.darkSheet, { backgroundColor: paleta.jornadas }]}>
          <View style={styles.journeyHeaderRow}>
            <Text
              accessibilityRole="header"
              style={[styles.journeyTitle, { fontSize: 16 * tamanhoFonte }]}
            >
              Jornada Atual
            </Text>

            <TouchableOpacity
              style={styles.newJourneyBtn}
              accessibilityRole="button"
              accessibilityLabel="Nova jornada"
              accessibilityHint="Abre a tela para criar uma jornada"
              onPress={() => router.push("/nova-jornada")}
            >
              <Ionicons name="add" size={16} color={COLORS.textDark} />

              <Text
                style={[styles.newJourneyText, { fontSize: 12 * tamanhoFonte }]}
              >
                Nova jornada
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card de jornada */}

          {carregandoJornada ? (
            <View style={styles.journeyLoading}>
              <ActivityIndicator color={COLORS.green} />
            </View>
          ) : jornada ? (
            <LinearGradient
              colors={[COLORS.green, COLORS.greenDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.journeyCard}
            >
              <View style={styles.journeyCardTop}>
                <View style={styles.bookmarkIcon}>
                  <Ionicons
                    name="bookmark"
                    size={16}
                    color={COLORS.textWhite}
                  />
                </View>

                <View style={styles.arrowBtn} accessible={false}>
                  <Ionicons
                    name="arrow-up-outline"
                    style={{ transform: [{ rotate: "45deg" }] }}
                    size={18}
                    color={COLORS.textWhite}
                  />
                </View>
              </View>

              <View style={styles.journeyCardBody}>
                <View>
                  <Text
                    style={[
                      styles.journeyName,

                      { fontSize: 20 * tamanhoFonte },
                    ]}
                  >
                    {jornada.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.journeyTags,

                      { fontSize: 12 * tamanhoFonte },
                    ]}
                  >
                    {jornada.categoria}
                  </Text>

                  <Text
                    style={[
                      styles.journeyTasksCount,

                      { fontSize: 17 * tamanhoFonte },
                    ]}
                  >
                    {tarefas.length}{" "}
                    {tarefas.length === 1 ? "Tarefa" : "Tarefas"}
                  </Text>

                  <View style={styles.journeyDateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color={COLORS.textWhiteMuted}
                    />

                    <Text
                      style={[
                        styles.journeyDate,

                        { fontSize: 12 * tamanhoFonte },
                      ]}
                    >
                      {formatarData(jornada.createdAt)}
                    </Text>
                  </View>
                </View>

                <CircularProgress
                  size={70}
                  strokeWidth={6}
                  progress={progressoJornada}
                  trackColor="rgba(255,255,255,0.25)"
                  progressColor={COLORS.textWhite}
                >
                  <Text
                    style={[
                      styles.journeyPercent,

                      { fontSize: 15 * tamanhoFonte },
                    ]}
                  >
                    {progressoJornada}%
                  </Text>
                </CircularProgress>
              </View>
            </LinearGradient>
          ) : (
            /* Estado vazio: nenhuma jornada */

            <LinearGradient
              colors={[COLORS.green, COLORS.greenDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.journeyCard, styles.journeyCardEmpty]}
            >
              <Ionicons
                name="map-outline"
                size={36}
                color="rgba(255,255,255,0.5)"
              />

              <Text
                style={[
                  styles.emptyJourneyTitle,

                  { fontSize: 16 * tamanhoFonte },
                ]}
              >
                Nenhuma jornada encontrada
              </Text>

              <Text
                style={[
                  styles.emptyJourneySubtitle,

                  { fontSize: 13 * tamanhoFonte },
                ]}
              >
                Crie sua primeira jornada e comece a evoluir!
              </Text>

              <TouchableOpacity
                style={styles.emptyJourneyBtn}
                accessibilityRole="button"
                accessibilityLabel="Criar jornada"
                accessibilityHint="Abre a tela para criar sua primeira jornada"
                onPress={() => router.push("/nova-jornada")}
              >
                <Ionicons name="add" size={16} color={COLORS.green} />

                <Text
                  style={[
                    styles.emptyJourneyBtnText,

                    { fontSize: 14 * tamanhoFonte },
                  ]}
                >
                  Criar jornada
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {/* Próximas Tarefas + botão */}

          <View style={styles.tarefasHeaderRow}>
            <Text
              accessibilityRole="header"
              style={[styles.nextTasksTitle, { fontSize: 16 * tamanhoFonte }]}
            >
              Próximas Tarefas
            </Text>

            {jornada && (
              <TouchableOpacity
                style={styles.newTaskBtn}
                accessibilityRole="button"
                accessibilityLabel="Nova tarefa"
                accessibilityHint="Abre a tela para adicionar uma tarefa à jornada atual"
                onPress={() =>
                  router.push({
                    pathname: "/nova-tarefa",

                    params: {
                      jornadaId: jornada._id,

                      jornadaTitulo: jornada.titulo,
                    },
                  })
                }
              >
                <Ionicons name="add" size={16} color={COLORS.textDark} />

                <Text
                  style={[styles.newTaskText, { fontSize: 12 * tamanhoFonte }]}
                >
                  Nova tarefa
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {!jornada ? (
            /* Nenhuma jornada: aviso abaixo do título */

            <View style={styles.emptyTasksContainer}>
              <Ionicons
                name="rocket-outline"
                size={28}
                color={COLORS.textGray}
              />

              <Text
                style={[styles.emptyTasksText, { fontSize: 14 * tamanhoFonte }]}
              >
                Crie uma jornada para começar
              </Text>
            </View>
          ) : tarefas.length === 0 ? (
            <View style={styles.emptyTasksContainer}>
              <Ionicons
                name="checkmark-done-outline"
                size={28}
                color={COLORS.green}
              />

              <Text
                style={[styles.emptyTasksText, { fontSize: 14 * tamanhoFonte }]}
              >
                Nenhuma tarefa pendente!
              </Text>
            </View>
          ) : (
            tarefas.map((t) => (
              <TaskItem
                key={t._id}
                title={t.titulo}
                date={
                  t.dataConclusao
                    ? new Date(t.dataConclusao).toLocaleDateString("pt-BR")
                    : "Pendente"
                }
                xpRecompensa={t.xpRecompensa}
                concluida={t.status === "Concluída"}
                requerAnexo={t.requerAnexo}
                onComplete={() => handleConcluirTarefa(t._id)}
                onNavigate={() => router.push(`/tarefa/${t._id}` as any)}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ---------- Toast de XP ---------- */}

      {toast.visivel && (
        <Animated.View
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,

            {
              opacity: toastAnim,

              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],

                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.toastText, { fontSize: 14 * tamanhoFonte }]}>
            {toast.mensagem}
          </Text>
        </Animated.View>
      )}

      {/* ---------- Barra de navegação inferior ---------- */}

      <View style={styles.tabBar}>
        <View
          accessibilityRole="tab"
          accessibilityLabel="Início"
          accessibilityState={{ selected: true }}
          style={styles.tabItem}
        >
          <Ionicons name="home" size={22} color={COLORS.green} />

          <Text
            style={[
              styles.tabLabel,

              { color: COLORS.green },

              { fontSize: 10 * tamanhoFonte },
            ]}
          >
            Início
          </Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/atividades")}
          accessibilityRole="button"
          accessibilityLabel="Jornadas"
          accessibilityHint="Abre a tela de atividades e jornadas"
        >
          <MaterialCommunityIcons
            name="compass-outline"
            size={22}
            color={COLORS.textGray}
          />

          <Text style={[styles.tabLabel, { fontSize: 10 * tamanhoFonte }]}>
            Jornadas
          </Text>
        </TouchableOpacity>

        <View accessible={false} style={styles.tabCenterWrapper}>
          <LinearGradient
            colors={[COLORS.green, "#0EA5E9"]}
            style={styles.tabCenterCircle}
          >
            <Text
              style={[styles.tabCenterLetter, { fontSize: 20 * tamanhoFonte }]}
            >
              E
            </Text>
          </LinearGradient>
        </View>

        <View
          accessible
          accessibilityLabel="Perfil, funcionalidade ainda não disponível"
          style={styles.tabItem}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.textGray} />

          <Text style={[styles.tabLabel, { fontSize: 10 * tamanhoFonte }]}>
            Perfil
          </Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/configuracoes")}
          accessibilityRole="button"
          accessibilityLabel="Configurações de acessibilidade"
          accessibilityHint="Abre as preferências de acessibilidade"
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textGray} />

          <Text style={[styles.tabLabel, { fontSize: 10 * tamanhoFonte }]}>
            Config.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------- Estilos ----------

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#fff",
  },

  safeAreaTop: {
    flex: 1,

    backgroundColor: COLORS.bgDark,
  },

  header: {
    backgroundColor: COLORS.bgLight,

    paddingHorizontal: 20,

    paddingTop: 16,

    paddingBottom: 20,
  },

  headerRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  avatar: {
    width: 56,

    height: 56,

    borderRadius: 28,
  },

  welcomeText: {
    fontSize: 13,

    color: COLORS.textGray,
  },

  userName: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.textDark,

    marginTop: 2,
  },

  badge: {
    marginTop: 6,

    alignSelf: "flex-start",

    backgroundColor: COLORS.green,

    paddingHorizontal: 10,

    paddingVertical: 3,

    borderRadius: 12,
  },

  badgeText: {
    color: COLORS.textWhite,

    fontSize: 10,

    fontWeight: "700",
  },

  divider: {
    height: 1,

    backgroundColor: "#E8E8E8",

    marginVertical: 18,
  },

  sectionTitleDark: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.textDark,

    marginBottom: 12,
  },

  overviewRow: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  overviewCard: {
    flex: 1,

    backgroundColor: COLORS.cardLight,

    borderRadius: 16,

    paddingVertical: 14,

    marginHorizontal: 4,

    alignItems: "center",
  },

  overviewNumber: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.textDark,

    marginTop: 6,
  },

  overviewPercent: {
    fontSize: 13,

    fontWeight: "700",

    color: COLORS.textDark,
  },

  overviewLabel: {
    fontSize: 11,

    color: COLORS.textDark,

    marginTop: 4,

    textAlign: "center",
  },

  overviewSubLabel: {
    fontSize: 10,

    color: COLORS.textGray,
  },

  darkSheet: {
    backgroundColor: COLORS.bgDark,

    borderTopLeftRadius: 24,

    borderTopRightRadius: 24,

    paddingHorizontal: 20,

    paddingTop: 20,

    marginTop: -4,
  },

  journeyHeaderRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 16,
  },

  journeyTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.textWhite,
  },

  newJourneyBtn: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: COLORS.green,

    borderRadius: 16,

    paddingHorizontal: 10,

    paddingVertical: 6,
  },

  newJourneyText: {
    fontSize: 12,

    fontWeight: "700",

    color: COLORS.textDark,

    marginLeft: 2,
  },

  journeyLoading: {
    height: 140,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.05)",

    borderRadius: 20,

    marginBottom: 24,
  },

  journeyCard: {
    borderRadius: 20,

    padding: 18,

    marginBottom: 24,
  },

  journeyCardEmpty: {
    alignItems: "center",

    paddingVertical: 28,

    gap: 8,
  },

  emptyJourneyTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.textWhite,

    textAlign: "center",

    marginTop: 4,
  },

  emptyJourneySubtitle: {
    fontSize: 13,

    color: COLORS.textWhiteMuted,

    textAlign: "center",

    marginBottom: 4,
  },

  emptyJourneyBtn: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#fff",

    paddingHorizontal: 16,

    paddingVertical: 8,

    borderRadius: 20,

    gap: 4,
  },

  emptyJourneyBtnText: {
    color: COLORS.green,

    fontWeight: "700",

    fontSize: 14,
  },

  journeyCardTop: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  bookmarkIcon: {
    width: 30,

    height: 30,

    borderRadius: 15,

    backgroundColor: "rgba(255,255,255,0.15)",

    alignItems: "center",

    justifyContent: "center",
  },

  arrowBtn: {
    width: 30,

    height: 30,

    borderRadius: 15,

    backgroundColor: "rgba(0,0,0,0.35)",

    alignItems: "center",

    justifyContent: "center",
  },

  journeyCardBody: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-end",

    marginTop: 14,
  },

  journeyName: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.textWhite,
  },

  journeyTags: {
    fontSize: 12,

    color: COLORS.textWhiteMuted,

    marginTop: 2,
  },

  journeyTasksCount: {
    fontSize: 17,

    fontWeight: "700",

    color: COLORS.textWhite,

    marginTop: 10,
  },

  journeyDateRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 8,
  },

  journeyDate: {
    fontSize: 12,

    color: COLORS.textWhiteMuted,

    marginLeft: 5,
  },

  journeyPercent: {
    fontSize: 15,

    fontWeight: "700",

    color: COLORS.textWhite,
  },

  nextTasksTitle: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.textWhite,
  },

  tarefasHeaderRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  newTaskBtn: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: COLORS.green,

    borderRadius: 16,

    paddingHorizontal: 10,

    paddingVertical: 6,
  },

  newTaskText: {
    fontSize: 12,

    fontWeight: "700",

    color: COLORS.textDark,

    marginLeft: 2,
  },

  emptyTasksContainer: {
    alignItems: "center",

    paddingVertical: 24,

    gap: 8,
  },

  emptyTasksText: {
    fontSize: 14,

    color: COLORS.textGray,

    textAlign: "center",
  },

  tabBar: {
    position: "absolute",

    bottom: 16,

    left: 16,

    right: 16,

    backgroundColor: "#1C1C1E",

    borderRadius: 28,

    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    shadowColor: "#000",

    shadowOpacity: 0.3,

    shadowRadius: 8,

    shadowOffset: { width: 0, height: 4 },

    elevation: 8,
  },

  tabItem: {
    alignItems: "center",
  },

  tabLabel: {
    fontSize: 10,

    color: COLORS.textGray,

    marginTop: 2,
  },

  tabCenterWrapper: {
    marginTop: -28,
  },

  tabCenterCircle: {
    width: 52,

    height: 52,

    borderRadius: 26,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 3,

    borderColor: COLORS.bgDark,
  },

  tabCenterLetter: {
    color: COLORS.textWhite,

    fontWeight: "800",

    fontSize: 20,
  },

  toast: {
    position: "absolute",

    bottom: 100,

    alignSelf: "center",

    backgroundColor: "#1C1C1E",

    borderRadius: 24,

    paddingHorizontal: 20,

    paddingVertical: 12,

    borderWidth: 1,

    borderColor: "rgba(47,217,141,0.4)",

    shadowColor: "#000",

    shadowOpacity: 0.4,

    shadowRadius: 12,

    shadowOffset: { width: 0, height: 4 },

    elevation: 10,
  },

  toastText: {
    color: COLORS.textWhite,

    fontSize: 14,

    fontWeight: "600",

    textAlign: "center",
  },
});
