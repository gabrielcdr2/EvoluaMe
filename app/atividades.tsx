import React, { useEffect, useState } from "react";

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import ItemAtividade from "../components/ItemAtividade";

type Atividade = {
  id: string;
  nome: string;
};

export default function AtividadesScreen() {
  const params = useLocalSearchParams();

  const area = typeof params.area === "string" ? params.area : "Atividades";

  const [texto, setTexto] = useState("");

  const [atividades, setAtividades] = useState<Atividade[]>([]);

  /*
    Cada área terá uma chave diferente.

    Exemplo:

    @evoluame_atividades_Estudos

    @evoluame_atividades_Atividade Física

    @evoluame_atividades_Leitura

    @evoluame_atividades_Línguas Estrangeiras
  */

  const chaveArmazenamento = `@evoluame_atividades_${area}`;

  /*
    Toda vez que a área mudar,
    carregamos apenas os dados daquela área.
  */

  useEffect(() => {
    carregarAtividades();
  }, [area]);

  async function carregarAtividades() {
    try {
      /*
        Limpa temporariamente a lista anterior
        enquanto carregamos a nova área.
      */

      setAtividades([]);
      setTexto("");

      const dadosSalvos = await AsyncStorage.getItem(chaveArmazenamento);

      if (dadosSalvos) {
        const listaSalva = JSON.parse(dadosSalvos);

        setAtividades(listaSalva);
      }
    } catch (error) {
      console.log("Erro ao carregar atividades:", error);
    }
  }

  /*
    Salva a lista daquela área específica.
  */

  async function salvarAtividades(novaLista: Atividade[]) {
    try {
      await AsyncStorage.setItem(chaveArmazenamento, JSON.stringify(novaLista));
    } catch (error) {
      console.log("Erro ao salvar atividades:", error);
    }
  }

  function adicionarAtividade() {
    const nome = texto.trim();

    /*
      Validação para impedir
      campo vazio.
    */

    if (nome === "") {
      Alert.alert("Campo vazio", "Digite uma atividade antes de adicionar.");

      return;
    }

    const novaAtividade: Atividade = {
      id: Date.now().toString(),

      nome: nome,
    };

    /*
      Criamos a nova lista.
    */

    const novaLista = [...atividades, novaAtividade];

    /*
      Atualizamos a tela.
    */

    setAtividades(novaLista);

    /*
      Salvamos apenas na área atual.
    */

    salvarAtividades(novaLista);

    /*
      Limpamos o campo.
    */

    setTexto("");
  }

  function removerAtividade(id: string) {
    const novaLista = atividades.filter((atividade) => atividade.id !== id);

    setAtividades(novaLista);

    /*
      Atualiza também os dados salvos.
    */

    salvarAtividades(novaLista);
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.emoji}>{obterEmoji()}</Text>

      <Text style={styles.titulo}>{area}</Text>

      <Text style={styles.subtitulo}>
        Adicione atividades para acompanhar sua evolução.
      </Text>

      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={setTexto}
        placeholder={obterPlaceholder()}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.botao} onPress={adicionarAtividade}>
        <Text style={styles.botaoTexto}>Adicionar atividade</Text>
      </TouchableOpacity>

      <Text style={styles.tituloLista}>Minhas atividades</Text>

      <FlatList
        data={atividades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemAtividade
            nome={item.nome}
            onRemover={() => removerAtividade(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma atividade adicionada ainda.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4FF",
    padding: 20,
    paddingTop: 55,
  },

  voltar: {
    marginBottom: 20,
  },

  voltarTexto: {
    color: "#6C4CFF",
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

  botao: {
    backgroundColor: "#6C4CFF",
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

  tituloLista: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1040",
    marginTop: 30,
    marginBottom: 15,
  },

  vazio: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginTop: 30,
  },
});
