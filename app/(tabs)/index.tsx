import React, { useCallback, useState } from "react";

import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useFocusEffect } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [nome, setNome] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function carregarNome() {
        try {
          const nomeSalvo = await AsyncStorage.getItem("@evolua_nome");

          if (nomeSalvo) {
            setNome(nomeSalvo);
          }
        } catch (error) {
          console.log("Erro ao carregar nome:", error);
        }
      }

      carregarNome();
    }, []),
  );

  function abrirArea(area: string) {
    router.push({
      pathname: "/atividades",
      params: {
        area: area,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>EvoluaMe</Text>

      <Text style={styles.titulo}>
        Olá{nome ? `, ${nome}` : ""}, onde você quer evoluir?
      </Text>

      <Text style={styles.subtitulo}>Escolha uma área para começar</Text>

      <View style={styles.opcoes}>
        <TouchableOpacity
          style={styles.opcao}
          onPress={() => abrirArea("Estudos")}
        >
          <Text style={styles.emoji}>📚</Text>

          <Text style={styles.texto}>Estudos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcao}
          onPress={() => abrirArea("Atividade Física")}
        >
          <Text style={styles.emoji}>🏃</Text>

          <Text style={styles.texto}>Atividade Física</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcao}
          onPress={() => abrirArea("Leitura")}
        >
          <Text style={styles.emoji}>📖</Text>

          <Text style={styles.texto}>Leitura</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcao}
          onPress={() => abrirArea("Línguas Estrangeiras")}
        >
          <Text style={styles.emoji}>🌎</Text>

          <Text style={styles.texto}>Línguas Estrangeiras</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F4FF",
    padding: 20,
  },

  logo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#6C4CFF",
    textAlign: "center",
    marginTop: 30,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#1A1040",
    textAlign: "center",
    marginTop: 40,
  },

  subtitulo: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  opcao: {
    width: "48%",
    height: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2DEFF",
  },

  emoji: {
    fontSize: 35,
    marginBottom: 10,
  },

  texto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1040",
    textAlign: "center",
  },
});
