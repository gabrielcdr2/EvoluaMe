import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import ItemAtividade from "../../../components/ItemAtividade";

type Atividade = {
  id: string;
  nome: string;
};

export default function Atividades() {
  const [texto, setTexto] = useState("");
  const [atividades, setAtividades] = useState<Atividade[]>([]);

  function adicionarAtividade() {
    const nome = texto.trim();

    if (nome === "") {
      Alert.alert("Campo vazio", "Digite uma atividade antes de adicionar.");
      return;
    }

    const novaAtividade: Atividade = {
      id: Date.now().toString(),
      nome: nome,
    };

    setAtividades((listaAtual) => [...listaAtual, novaAtividade]);

    setTexto("");
  }

  function removerAtividade(id: string) {
    setAtividades((listaAtual) =>
      listaAtual.filter((atividade) => atividade.id !== id),
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Minhas Atividades</Text>

      <Text style={styles.subtitulo}>
        Adicione atividades para acompanhar sua evolução.
      </Text>

      <TextInput
        style={styles.input}
        value={texto}
        onChangeText={setTexto}
        placeholder="Digite uma atividade..."
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.botao} onPress={adicionarAtividade}>
        <Text style={styles.botaoTexto}>Adicionar atividade</Text>
      </TouchableOpacity>

      <Text style={styles.tituloLista}>Suas atividades</Text>

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
          <Text style={styles.vazio}>Nenhuma atividade adicionada.</Text>
        }
        contentContainerStyle={
          atividades.length === 0 ? styles.listaVazia : styles.lista
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 50,
  },

  voltar: {
    marginBottom: 20,
  },

  voltarTexto: {
    fontSize: 16,
    color: "#6c4cff",
    fontWeight: "bold",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },

  botao: {
    backgroundColor: "#6c4cff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  tituloLista: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 15,
  },

  lista: {
    paddingBottom: 20,
  },

  listaVazia: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 30,
  },

  vazio: {
    color: "#777",
    fontSize: 16,
  },
});
