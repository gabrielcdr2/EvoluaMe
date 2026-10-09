import React, { useEffect, useMemo, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { useUsuario } from "../hooks/useUsuario";
import { useAcessibilidade } from "../contexts/AcessibilidadeContext";

import {
  buscarAtividades,
  criarAtividade,
  deletarAtividade,
  concluirAtividadeAPI,
} from "../services/api";

type Atividade = {
  _id: string;

  nome: string;
};

export default function AtividadesScreen() {
  const { tema, tamanhoFonte } = useAcessibilidade();
  const escuro = tema === "dark";
  const cores = useMemo(
    () => ({
      fundo: escuro ? "#131313" : "#FFFFFF",
      card: escuro ? "#212124" : "#F4F4F5",
      texto: escuro ? "#FFFFFF" : "#161616",
      secundario: escuro ? "#B0B0B5" : "#68686E",
      borda: escuro ? "#38383C" : "#E7E7E9",
      campo: escuro ? "#29292D" : "#FFFFFF",
      verde: "#2FD98D",
      verdeTexto: "#10251B",
    }),
    [escuro],
  );

  // Estilos calculados conforme as preferências de acessibilidade.
  // As funções e chamadas à API abaixo permanecem intactas.
  const estilos = useMemo(() => {
    const sobreposicoes: Record<string, any> = {
      container: { backgroundColor: cores.fundo },
      voltarTexto: { color: cores.texto },
      titulo: { color: cores.texto },
      subtitulo: { color: cores.secundario },
      input: {
        backgroundColor: cores.campo,
        borderColor: cores.borda,
        color: cores.texto,
      },
      mensagemCard: { backgroundColor: cores.card },
      mensagemTexto: { color: cores.texto },
      tituloLista: { color: cores.texto },
      vazio: { color: cores.secundario },
      cardDesafio: { backgroundColor: cores.card, borderColor: cores.borda },
      tipoDesafio: { color: cores.verde },
      nomeDesafio: { color: cores.texto },
      recompensa: { color: cores.secundario },
      climaCard: { backgroundColor: cores.card, borderColor: cores.borda },
      climaTitulo: { color: cores.texto },
      climaDescricao: { color: cores.secundario },
      resultadoClima: { backgroundColor: cores.campo },
      cidadeClima: { color: cores.texto },
      infoClima: { color: cores.secundario },
      recomendacaoCard: { backgroundColor: cores.campo },
      recomendacaoTitulo: { color: cores.texto },
      recomendacaoTexto: { color: cores.texto },
      recompensaRecomendada: { color: cores.secundario },
      botao: { backgroundColor: cores.verde },
      botaoClima: { backgroundColor: cores.verde },
      botaoConcluir: { backgroundColor: cores.verde },
      botaoAdicionarRecomendacao: { backgroundColor: cores.verde },
      botaoTexto: { color: cores.verdeTexto },
      textoConcluir: { color: cores.verdeTexto },
    };
    const resultado: Record<string, any> = {};
    for (const [chave, estilo] of Object.entries(styles)) {
      // Um estilo pode não ter fontSize nem lineHeight.
      // O acesso por chave evita erros na união de tipos do TypeScript.
      const original: Record<string, any> = {
        ...StyleSheet.flatten(estilo),
      };
      const tamanhoOriginal = original["fontSize"];
      const alturaOriginal = original["lineHeight"];

      if (typeof tamanhoOriginal === "number") {
        original["fontSize"] = tamanhoOriginal * tamanhoFonte;
      }
      if (typeof alturaOriginal === "number") {
        original["lineHeight"] = alturaOriginal * tamanhoFonte;
      }

      resultado[chave] = {
        ...original,
        ...(sobreposicoes[chave] || {}),
      };
    }
    return resultado;
  }, [cores, tamanhoFonte]);

  const usuarioId = useUsuario();

  const params = useLocalSearchParams();

  const area = typeof params.area === "string" ? params.area : "Atividades";

  const [texto, setTexto] = useState("");

  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [atividades, setAtividades] = useState<Atividade[]>([]);

  // CLIMA

  const [cidade, setCidade] = useState("");

  const [cidadeEncontrada, setCidadeEncontrada] = useState("");

  const [temperatura, setTemperatura] = useState<number | null>(null);

  const [sensacao, setSensacao] = useState<number | null>(null);

  const [vento, setVento] = useState<number | null>(null);

  const [carregandoClima, setCarregandoClima] = useState(false);

  const [erroClima, setErroClima] = useState("");

  const [recomendacao, setRecomendacao] = useState("");

  useEffect(() => {
    if (usuarioId) carregarAtividades();
  }, [area, usuarioId]);

  async function carregarAtividades() {
    try {
      setCarregando(true);

      setTexto("");

      const lista = await buscarAtividades(usuarioId!, area);

      setAtividades(lista);
    } catch (error) {
      console.log("Erro ao carregar atividades:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function adicionarAtividade() {
    const nome = texto.trim();

    if (nome === "") {
      setErro("Digite uma atividade antes de adicionar.");

      return;
    }

    if (!usuarioId) return;

    try {
      setErro("");

      setMensagem("");

      const nova = await criarAtividade(usuarioId, area, nome);

      setAtividades((prev) => [nova, ...prev]);

      setTexto("");
    } catch (error) {
      setErro("Não foi possível adicionar o desafio.");
    }
  }

  async function adicionarRecomendacao() {
    if (recomendacao === "" || !usuarioId) return;

    try {
      const nova = await criarAtividade(usuarioId, area, recomendacao);

      setAtividades((prev) => [nova, ...prev]);

      setMensagem("🎯 Desafio recomendado adicionado!");
    } catch (error) {
      setMensagem("Não foi possível adicionar a recomendação.");
    }
  }

  async function removerAtividade(id: string) {
    try {
      await deletarAtividade(id);

      setAtividades((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.log("Erro ao remover atividade:", error);
    }
  }

  async function concluirAtividade(id: string) {
    if (!usuarioId) return;

    try {
      const resultado = await concluirAtividadeAPI(usuarioId, id);

      setAtividades((prev) => prev.filter((a) => a._id !== id));

      setMensagem(resultado.mensagem ?? "🎉 Desafio concluído!");
    } catch (error) {
      setMensagem("Não foi possível concluir o desafio.");
    }
  }

  function gerarRecomendacao(
    temp: number,

    velocidadeVento: number,
  ) {
    if (temp >= 32) {
      return "Faça 20 minutos de alongamento e exercícios leves em ambiente coberto.";
    }

    if (temp <= 15) {
      return "Faça 20 minutos de caminhada leve e exercícios de aquecimento.";
    }

    if (velocidadeVento >= 35) {
      return "Faça 25 minutos de exercícios em um local protegido do vento.";
    }

    if (temp >= 25) {
      return "Faça uma caminhada de 30 minutos em ritmo moderado.";
    }

    return "Faça 30 minutos de caminhada ou corrida leve ao ar livre.";
  }

  async function buscarClima() {
    if (cidade.trim() === "") {
      setErroClima("Digite uma cidade.");

      return;
    }

    try {
      setCarregandoClima(true);

      setErroClima("");

      setTemperatura(null);

      setSensacao(null);

      setVento(null);

      setRecomendacao("");

      // 1ª API - NOMINATIM

      const respostaLocal = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          cidade,
        )}&limit=1&countrycodes=br`,

        {
          headers: {
            Accept: "application/json",

            "Accept-Language": "pt-BR",

            "User-Agent": "EvoluaMe/1.0",
          },
        },
      );

      if (!respostaLocal.ok) {
        throw new Error("Erro ao buscar cidade");
      }

      const dadosLocal = await respostaLocal.json();

      if (!dadosLocal || dadosLocal.length === 0) {
        setErroClima("Cidade não encontrada.");

        return;
      }

      const latitude = dadosLocal[0].lat;

      const longitude = dadosLocal[0].lon;

      setCidadeEncontrada(dadosLocal[0].display_name);

      // 2ª API - OPEN METEO

      const respostaClima = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m`,
      );

      if (!respostaClima.ok) {
        throw new Error("Erro ao buscar clima");
      }

      const dadosClima = await respostaClima.json();

      if (!dadosClima.current) {
        throw new Error("Dados climáticos não encontrados.");
      }

      const temp = dadosClima.current.temperature_2m;

      const sensacaoAtual = dadosClima.current.apparent_temperature;

      const ventoAtual = dadosClima.current.wind_speed_10m;

      setTemperatura(temp);

      setSensacao(sensacaoAtual);

      setVento(ventoAtual);

      const desafio = gerarRecomendacao(
        temp,

        ventoAtual,
      );

      setRecomendacao(desafio);
    } catch (error) {
      console.log(
        "ERRO CLIMA:",

        error,
      );

      setErroClima("Não foi possível consultar o clima.");
    } finally {
      setCarregandoClima(false);
    }
  }

  function obterEmoji() {
    if (area === "Estudos") {
      return "📚";
    }

    if (area === "Atividade Física") {
      return "🏃";
    }

    if (area === "Leitura") {
      return "📖";
    }

    if (area === "Línguas Estrangeiras") {
      return "🌎";
    }

    return "✅";
  }

  function obterPlaceholder() {
    if (area === "Estudos") {
      return "Ex: Estudar Português";
    }

    if (area === "Atividade Física") {
      return "Ex: Fazer 30 minutos de caminhada";
    }

    if (area === "Leitura") {
      return "Ex: Ler 20 páginas";
    }

    if (area === "Línguas Estrangeiras") {
      return "Ex: Estudar inglês por 30 minutos";
    }

    return "Digite uma atividade...";
  }

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={estilos.voltar}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => router.back()}
      >
        <Text style={estilos.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={estilos.emoji}>{obterEmoji()}</Text>

      <Text style={estilos.titulo} accessibilityRole="header">
        {area}
      </Text>

      <Text style={estilos.subtitulo}>
        Adicione desafios para acompanhar sua evolução.
      </Text>

      {area === "Atividade Física" && (
        <View style={estilos.climaCard}>
          <Text style={estilos.climaTitulo}>
            🌤 Clima para atividade física
          </Text>

          <Text style={estilos.climaDescricao}>
            Consulte o clima para receber um desafio recomendado.
          </Text>

          <TextInput
            style={estilos.input}
            value={cidade}
            onChangeText={(valor) => {
              setCidade(valor);

              if (erroClima !== "") {
                setErroClima("");
              }
            }}
            placeholder="Digite sua cidade"
            accessibilityLabel="Cidade para consulta do clima"
            placeholderTextColor={cores.secundario}
          />

          <TouchableOpacity
            style={estilos.botaoClima}
            accessibilityRole="button"
            accessibilityLabel="Consultar clima"
            onPress={buscarClima}
            disabled={carregandoClima}
          >
            <Text style={estilos.botaoTexto}>
              {carregandoClima ? "Buscando..." : "Consultar clima"}
            </Text>
          </TouchableOpacity>

          {erroClima !== "" && <Text style={estilos.erro}>⚠ {erroClima}</Text>}

          {temperatura !== null && (
            <View style={estilos.resultadoClima}>
              <Text style={estilos.cidadeClima}>📍 {cidadeEncontrada}</Text>

              <Text style={estilos.infoClima}>
                🌡 Temperatura: {temperatura} °C
              </Text>

              <Text style={estilos.infoClima}>
                🌤 Sensação térmica: {sensacao} °C
              </Text>

              <Text style={estilos.infoClima}>💨 Vento: {vento} km/h</Text>
            </View>
          )}

          {recomendacao !== "" && (
            <View style={estilos.recomendacaoCard}>
              <Text style={estilos.recomendacaoTitulo}>
                🎯 Desafio recomendado
              </Text>

              <Text style={estilos.recomendacaoTexto}>{recomendacao}</Text>

              <Text style={estilos.recompensaRecomendada}>
                ⭐ Recompensa: +50 XP
              </Text>

              <TouchableOpacity
                style={estilos.botaoAdicionarRecomendacao}
                accessibilityRole="button"
                accessibilityLabel="Adicionar desafio recomendado"
                onPress={adicionarRecomendacao}
              >
                <Text style={estilos.botaoTexto}>Adicionar este desafio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <TextInput
        style={[estilos.input, erro !== "" && estilos.inputErro]}
        value={texto}
        onChangeText={(valor) => {
          setTexto(valor);

          if (erro !== "") {
            setErro("");
          }

          if (mensagem !== "") {
            setMensagem("");
          }
        }}
        accessibilityLabel="Nome do novo desafio"
        placeholder={obterPlaceholder()}
        placeholderTextColor={cores.secundario}
        returnKeyType="done"
        onSubmitEditing={adicionarAtividade}
      />

      {erro !== "" && <Text style={estilos.erro}>⚠ {erro}</Text>}

      <TouchableOpacity
        style={estilos.botao}
        accessibilityRole="button"
        accessibilityLabel="Adicionar desafio"
        onPress={adicionarAtividade}
      >
        <Text style={estilos.botaoTexto}>Adicionar desafio</Text>
      </TouchableOpacity>

      {mensagem !== "" && (
        <View style={estilos.mensagemCard}>
          <Text style={estilos.mensagemTexto}>{mensagem}</Text>
        </View>
      )}

      <Text style={estilos.tituloLista}>Meus desafios</Text>

      {atividades.length === 0 ? (
        <Text style={estilos.vazio}>Nenhum desafio adicionado ainda.</Text>
      ) : (
        atividades.map((item) => (
          <View key={item._id} style={estilos.cardDesafio}>
            <Text style={estilos.tipoDesafio}>🎯 DESAFIO</Text>

            <Text style={estilos.nomeDesafio}>{item.nome}</Text>

            <Text style={estilos.recompensa}>⭐ Recompensa: +50 XP</Text>

            <TouchableOpacity
              style={estilos.botaoConcluir}
              accessibilityRole="button"
              accessibilityLabel={`Concluir desafio: ${item.nome}`}
              onPress={() => concluirAtividade(item._id)}
            >
              <Text style={estilos.textoConcluir}>✓ Concluir desafio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={estilos.botaoRemover}
              accessibilityRole="button"
              accessibilityLabel={`Remover desafio: ${item.nome}`}
              onPress={() => removerAtividade(item._id)}
            >
              <Text style={estilos.textoRemover}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#faf9fc",
  },

  conteudo: {
    padding: 20,

    paddingTop: 55,

    paddingBottom: 80,
  },

  voltar: {
    marginBottom: 20,
  },

  voltarTexto: {
    color: "#010007",

    fontSize: 16,

    fontWeight: "700",
  },

  emoji: {
    fontSize: 45,

    marginBottom: 10,
  },

  titulo: {
    fontSize: 30,

    fontWeight: "bold",

    color: "#1A1040",
  },

  subtitulo: {
    color: "#7C6FAE",

    fontSize: 16,

    marginTop: 8,

    marginBottom: 25,
  },

  input: {
    backgroundColor: "#FFFFFF",

    borderWidth: 1.5,

    borderColor: "#E2DEFF",

    padding: 15,

    borderRadius: 14,

    fontSize: 16,
  },

  inputErro: {
    borderColor: "#D64545",
  },

  erro: {
    color: "#D64545",

    fontSize: 14,

    marginTop: 8,

    marginBottom: 8,
  },

  botao: {
    backgroundColor: "#20C997",

    padding: 16,

    borderRadius: 14,

    alignItems: "center",

    marginTop: 12,
  },

  botaoTexto: {
    color: "#FFFFFF",

    fontWeight: "bold",

    fontSize: 16,
  },

  mensagemCard: {
    backgroundColor: "#EDE9FF",

    padding: 15,

    borderRadius: 12,

    marginTop: 15,
  },

  mensagemTexto: {
    color: "#000a07",

    fontWeight: "bold",

    textAlign: "center",

    fontSize: 15,
  },

  tituloLista: {
    fontSize: 20,

    fontWeight: "bold",

    color: "#000504",

    marginTop: 30,

    marginBottom: 15,
  },

  vazio: {
    color: "#888",

    fontSize: 15,

    textAlign: "center",

    marginTop: 30,
  },

  cardDesafio: {
    backgroundColor: "#20C997",

    padding: 18,

    marginBottom: 12,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: "#E2DEFF",
  },

  tipoDesafio: {
    color: "#20C997",

    fontSize: 12,

    fontWeight: "bold",

    marginBottom: 6,
  },

  nomeDesafio: {
    fontSize: 18,

    fontWeight: "bold",

    color: "#20C997",
  },

  recompensa: {
    color: "#7C6FAE",

    fontSize: 14,

    marginTop: 8,

    marginBottom: 15,
  },

  botaoConcluir: {
    backgroundColor: "#20C997",

    padding: 13,

    borderRadius: 10,

    alignItems: "center",
  },

  textoConcluir: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "bold",
  },

  botaoRemover: {
    padding: 10,

    marginTop: 5,

    alignItems: "center",
  },

  textoRemover: {
    color: "#D64545",

    fontSize: 14,

    fontWeight: "600",
  },

  climaCard: {
    backgroundColor: "#FFFFFF",

    padding: 16,

    borderRadius: 16,

    marginBottom: 20,

    borderWidth: 1,

    borderColor: "#E2DEFF",
  },

  climaTitulo: {
    fontSize: 18,

    fontWeight: "bold",

    color: "#1A1040",

    marginBottom: 6,
  },

  climaDescricao: {
    color: "#02000a",

    fontSize: 14,

    marginBottom: 14,
  },

  botaoClima: {
    backgroundColor: "#20C997",

    padding: 14,

    borderRadius: 12,

    alignItems: "center",

    marginTop: 10,
  },

  resultadoClima: {
    marginTop: 15,

    backgroundColor: "#F5F4FF",

    padding: 14,

    borderRadius: 12,
  },

  cidadeClima: {
    fontWeight: "bold",

    fontSize: 15,

    color: "#03010c",

    marginBottom: 10,
  },

  infoClima: {
    fontSize: 15,

    color: "#4E456D",

    marginBottom: 5,
  },

  recomendacaoCard: {
    marginTop: 15,

    padding: 15,

    borderRadius: 14,

    backgroundColor: "#EEE9FF",
  },

  recomendacaoTitulo: {
    fontSize: 17,

    fontWeight: "bold",

    color: "#020107",

    marginBottom: 8,
  },

  recomendacaoTexto: {
    fontSize: 16,

    color: "#010005",

    lineHeight: 22,
  },

  recompensaRecomendada: {
    color: "#6d6b75",

    fontSize: 14,

    marginTop: 10,

    marginBottom: 12,
  },

  botaoAdicionarRecomendacao: {
    backgroundColor: "#20C997",

    padding: 13,

    borderRadius: 10,

    alignItems: "center",
  },
});
