import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAcessibilidade } from "@/contexts/AcessibilidadeContext";

const VERDE = "#2FD98D";

export default function ConfiguracoesScreen() {
  const { tema, tamanhoFonte, alterarTema, aumentarFonte, diminuirFonte } =
    useAcessibilidade();
  const escuro = tema === "dark";
  const cores = {
    fundo: escuro ? "#131313" : "#FFFFFF",
    card: escuro ? "#212124" : "#F4F4F5",
    texto: escuro ? "#FFFFFF" : "#161616",
    secundario: escuro ? "#B0B0B5" : "#77777E",
    borda: escuro ? "#38383C" : "#E7E7E9",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={styles.conteudo}
    >
      <TouchableOpacity
        style={styles.voltar}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Voltar para a tela anterior"
      >
        <Ionicons name="arrow-back" size={22} color={cores.texto} />
        <Text
          style={{
            color: cores.texto,
            fontSize: 15 * tamanhoFonte,
            fontWeight: "600",
          }}
        >
          Voltar
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.titulo,
          { color: cores.texto, fontSize: 28 * tamanhoFonte },
        ]}
        accessibilityRole="header"
      >
        Configurações
      </Text>
      <Text
        style={[
          styles.subtitulo,
          { color: cores.secundario, fontSize: 14 * tamanhoFonte },
        ]}
      >
        Personalize sua experiência no EvoluaMe.
      </Text>

      <Text
        style={[
          styles.secao,
          { color: cores.texto, fontSize: 17 * tamanhoFonte },
        ]}
        accessibilityRole="header"
      >
        Aparência
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <View style={styles.linha}>
          <View style={styles.linhaTexto}>
            <View style={styles.icone}>
              <Ionicons
                name={escuro ? "moon-outline" : "sunny-outline"}
                size={21}
                color="#161616"
              />
            </View>
            <View style={styles.textos}>
              <Text
                style={{
                  color: cores.texto,
                  fontSize: 16 * tamanhoFonte,
                  fontWeight: "700",
                }}
              >
                Modo escuro
              </Text>
              <Text
                style={{
                  color: cores.secundario,
                  fontSize: 12 * tamanhoFonte,
                  marginTop: 4,
                }}
              >
                Alterar entre tema claro e escuro
              </Text>
            </View>
          </View>
          <Switch
            value={escuro}
            onValueChange={(valor) => alterarTema(valor ? "dark" : "light")}
            trackColor={{ false: "#C9C9CE", true: VERDE }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Ativar ou desativar modo escuro"
            accessibilityRole="switch"
          />
        </View>
      </View>

      <Text
        style={[
          styles.secao,
          { color: cores.texto, fontSize: 17 * tamanhoFonte },
        ]}
        accessibilityRole="header"
      >
        Texto e leitura
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
      >
        <View style={styles.linhaTexto}>
          <View style={styles.icone}>
            <Ionicons name="text-outline" size={22} color="#161616" />
          </View>
          <View style={styles.textos}>
            <Text
              style={{
                color: cores.texto,
                fontSize: 16 * tamanhoFonte,
                fontWeight: "700",
              }}
            >
              Tamanho da fonte
            </Text>
            <Text
              style={{
                color: cores.secundario,
                fontSize: 12 * tamanhoFonte,
                marginTop: 4,
              }}
            >
              Ajuste o tamanho das letras
            </Text>
          </View>
        </View>

        <View style={styles.controleFonte}>
          <TouchableOpacity
            style={[
              styles.botaoFonte,
              { backgroundColor: cores.fundo, borderColor: cores.borda },
            ]}
            onPress={diminuirFonte}
            disabled={tamanhoFonte <= 0.8}
            accessibilityRole="button"
            accessibilityLabel="Diminuir tamanho da fonte"
            accessibilityState={{ disabled: tamanhoFonte <= 0.8 }}
          >
            <Text
              style={{ color: cores.texto, fontSize: 20, fontWeight: "700" }}
            >
              A−
            </Text>
          </TouchableOpacity>
          <View
            style={styles.valorFonte}
            accessibilityLabel={`Tamanho da fonte: ${Math.round(tamanhoFonte * 100)} por cento`}
          >
            <Text style={{ color: VERDE, fontSize: 21, fontWeight: "800" }}>
              {Math.round(tamanhoFonte * 100)}%
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.botaoFonte,
              { backgroundColor: cores.fundo, borderColor: cores.borda },
            ]}
            onPress={aumentarFonte}
            disabled={tamanhoFonte >= 1.5}
            accessibilityRole="button"
            accessibilityLabel="Aumentar tamanho da fonte"
            accessibilityState={{ disabled: tamanhoFonte >= 1.5 }}
          >
            <Text
              style={{ color: cores.texto, fontSize: 20, fontWeight: "700" }}
            >
              A+
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.exemplo,
            { backgroundColor: cores.fundo, borderColor: cores.borda },
          ]}
        >
          <Text
            style={{
              color: cores.texto,
              fontSize: 15 * tamanhoFonte,
              textAlign: "center",
              lineHeight: 23 * tamanhoFonte,
            }}
          >
            Cada pequeno passo é uma conquista. Continue evoluindo!
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.secao,
          { color: cores.texto, fontSize: 17 * tamanhoFonte },
        ]}
        accessibilityRole="header"
      >
        Comunicação acessível
      </Text>
      <TouchableOpacity
        style={[
          styles.card,
          styles.linha,
          { backgroundColor: cores.card, borderColor: cores.borda },
        ]}
        onPress={() => router.push("/libras")}
        accessibilityRole="button"
        accessibilityLabel="Libras, Língua Brasileira de Sinais"
        accessibilityHint="Abre a página com informações e acesso ao VLibras"
      >
        <View style={styles.linhaTexto}>
          <View style={styles.icone}>
            <Ionicons name="hand-left-outline" size={22} color="#161616" />
          </View>
          <View style={styles.textos}>
            <Text
              style={{
                color: cores.texto,
                fontSize: 16 * tamanhoFonte,
                fontWeight: "700",
              }}
            >
              Libras
            </Text>
            <Text
              style={{
                color: cores.secundario,
                fontSize: 12 * tamanhoFonte,
                marginTop: 4,
              }}
            >
              Conheça o recurso VLibras
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={cores.secundario} />
      </TouchableOpacity>

      <View style={styles.rodape}>
        <Ionicons name="checkmark-circle" size={19} color={VERDE} />
        <Text
          style={{
            color: cores.secundario,
            fontSize: 12 * tamanhoFonte,
            flex: 1,
          }}
        >
          Suas preferências de tema e fonte são salvas automaticamente.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { paddingHorizontal: 20, paddingTop: 45, paddingBottom: 70 },
  voltar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 30,
    alignSelf: "flex-start",
    minHeight: 44,
  },
  titulo: { fontWeight: "800", marginBottom: 8 },
  subtitulo: { marginBottom: 30 },
  secao: { fontWeight: "700", marginBottom: 14 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, marginBottom: 28 },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  linhaTexto: { flexDirection: "row", alignItems: "center", flex: 1 },
  icone: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: VERDE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textos: { flex: 1 },
  controleFonte: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  botaoFonte: {
    width: 70,
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  valorFonte: { flex: 1, alignItems: "center" },
  exemplo: { borderWidth: 1, borderRadius: 13, padding: 20, marginTop: 20 },
  rodape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 5,
  },
});
