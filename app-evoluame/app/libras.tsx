import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAcessibilidade } from "@/contexts/AcessibilidadeContext";

const VERDE = "#2FD98D";

const URL_VLIBRAS =
  "https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras";

type VideoLibras = {
  id: string;
  titulo: string;
  descricao: string;
  uri: string | null;
};

const VIDEOS: VideoLibras[] = [
  {
    id: "introducao",
    titulo: "Conheça o EvoluaMe",
    descricao: "Apresentação das funcionalidades do aplicativo.",
    uri: null,
  },
  {
    id: "jornadas",
    titulo: "Como criar uma jornada",
    descricao: "Aprenda a organizar seus objetivos.",
    uri: null,
  },
  {
    id: "tarefas",
    titulo: "Como adicionar e concluir tarefas",
    descricao: "Entenda como acompanhar suas atividades.",
    uri: null,
  },
  {
    id: "xp",
    titulo: "XP e níveis",
    descricao: "Saiba como funciona sua evolução.",
    uri: null,
  },
];

export default function LibrasScreen() {
  const { tema, tamanhoFonte } = useAcessibilidade();
  const [selecionado, setSelecionado] = useState<VideoLibras | null>(null);

  const escuro = tema === "dark";
  const fundo = escuro ? "#131313" : "#FFFFFF";
  const card = escuro ? "#212124" : "#F4F4F5";
  const texto = escuro ? "#FFFFFF" : "#161616";
  const secundario = escuro ? "#B0B0B5" : "#77777E";

  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
  });

  async function selecionarVideo(video: VideoLibras) {
    if (!video.uri) return;

    setSelecionado(video);

    try {
      await player.replaceAsync(video.uri);
      player.play();
    } catch (error) {
      console.log("Erro ao reproduzir vídeo:", error);
    }
  }

  async function abrirVLibras() {
    try {
      await Linking.openURL(URL_VLIBRAS);
    } catch (error) {
      console.log("Erro ao abrir VLibras:", error);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: fundo }}
      contentContainerStyle={styles.conteudo}
    >
      <TouchableOpacity
        style={styles.voltar}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar às configurações"
      >
        <Ionicons name="arrow-back" size={22} color={texto} />
        <Text
          style={{
            color: texto,
            fontSize: 15 * tamanhoFonte,
            fontWeight: "600",
          }}
        >
          Voltar
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: texto,
          fontSize: 28 * tamanhoFonte,
          fontWeight: "800",
        }}
        accessibilityRole="header"
      >
        Central de Libras
      </Text>

      <Text
        style={{
          color: secundario,
          fontSize: 14 * tamanhoFonte,
          lineHeight: 22 * tamanhoFonte,
          marginTop: 12,
        }}
      >
        Aprenda a utilizar o EvoluaMe por meio de vídeos explicativos em Língua
        Brasileira de Sinais.
      </Text>

      {selecionado && (
        <View style={[styles.card, { backgroundColor: card }]}>
          <Text
            style={{
              color: texto,
              fontSize: 18 * tamanhoFonte,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            {selecionado.titulo}
          </Text>

          <VideoView
            player={player}
            style={styles.video}
            nativeControls
            allowsFullscreen
            contentFit="contain"
          />
        </View>
      )}

      <Text
        style={{
          color: texto,
          fontSize: 20 * tamanhoFonte,
          fontWeight: "700",
          marginTop: 30,
          marginBottom: 14,
        }}
        accessibilityRole="header"
      >
        Tutoriais em Libras
      </Text>

      {VIDEOS.map((video) => {
        const disponivel = Boolean(video.uri);

        return (
          <TouchableOpacity
            key={video.id}
            style={[styles.itemVideo, { backgroundColor: card }]}
            onPress={() => selecionarVideo(video)}
            disabled={!disponivel}
            accessibilityRole="button"
            accessibilityState={{
              disabled: !disponivel,
            }}
            accessibilityLabel={
              `${video.titulo}. ` +
              (disponivel
                ? "Reproduzir vídeo em Libras"
                : "Vídeo ainda não disponível")
            }
          >
            <Ionicons
              name={disponivel ? "play-circle-outline" : "videocam-outline"}
              size={32}
              color={disponivel ? VERDE : secundario}
            />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: texto,
                  fontSize: 16 * tamanhoFonte,
                  fontWeight: "700",
                }}
              >
                {video.titulo}
              </Text>

              <Text
                style={{
                  color: secundario,
                  fontSize: 13 * tamanhoFonte,
                  marginTop: 5,
                }}
              >
                {video.descricao}
              </Text>

              {!disponivel && (
                <Text
                  style={{
                    color: secundario,
                    fontSize: 12 * tamanhoFonte,
                    marginTop: 8,
                  }}
                >
                  Em preparação
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={[styles.card, { backgroundColor: card }]}>
        <Ionicons name="hand-left-outline" size={30} color={VERDE} />

        <Text
          style={{
            color: texto,
            fontSize: 18 * tamanhoFonte,
            fontWeight: "700",
            marginTop: 12,
          }}
        >
          Conheça o VLibras
        </Text>

        <Text
          style={{
            color: secundario,
            fontSize: 14 * tamanhoFonte,
            lineHeight: 22 * tamanhoFonte,
            marginTop: 10,
          }}
        >
          Na versão web do EvoluaMe, você pode utilizar o avatar do VLibras para
          traduzir textos. Conheça também o projeto oficial.
        </Text>

        <TouchableOpacity
          style={styles.botao}
          onPress={abrirVLibras}
          accessibilityRole="link"
          accessibilityLabel="Abrir site oficial do VLibras"
        >
          <Text style={styles.botaoTexto}>Abrir site do VLibras</Text>

          <Ionicons name="open-outline" size={18} color="#161616" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 60,
  },
  voltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 30,
    alignSelf: "flex-start",
    minHeight: 44,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    marginTop: 24,
    marginBottom: 20,
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 12,
  },
  itemVideo: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 88,
  },
  botao: {
    marginTop: 20,
    borderRadius: 14,
    padding: 15,
    backgroundColor: VERDE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botaoTexto: {
    color: "#161616",
    fontWeight: "700",
    fontSize: 15,
  },
});
