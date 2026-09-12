import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ItemAtividadeProps = {
  nome: string;
  onRemover: () => void;
  onConcluir: () => void;
};

export default function ItemAtividade({
  nome,
  onRemover,
  onConcluir,
}: ItemAtividadeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.desafio}>🎯 DESAFIO</Text>

      <Text style={styles.nome}>
        {nome}
      </Text>

      <Text style={styles.recompensa}>
        ⭐ Recompensa: +50 XP
      </Text>

      <TouchableOpacity
        style={styles.botaoConcluir}
        onPress={onConcluir}
      >
        <Text style={styles.textoConcluir}>
          ✓ Concluir desafio
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoRemover}
        onPress={onRemover}
      >
        <Text style={styles.textoRemover}>
          Remover
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E2DEFF",
  },

  desafio: {
    color: "#6C4CFF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1040",
  },

  recompensa: {
    color: "#7C6FAE",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 15,
  },

  botaoConcluir: {
    backgroundColor: "#6C4CFF",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  textoConcluir: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  botaoRemover: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
  },

  textoRemover: {
    color: "#D64545",
    fontSize: 14,
    fontWeight: "600",
  },
});