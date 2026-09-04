import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ItemAtividadeProps = {
  nome: string;
  onRemover: () => void;
};

export default function ItemAtividade({ nome, onRemover }: ItemAtividadeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.nome}>{nome}</Text>

      <TouchableOpacity style={styles.botaoRemover} onPress={onRemover}>
        <Text style={styles.textoRemover}>Remover</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 12,
  },

  nome: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },

  botaoRemover: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eeeeee",
  },

  textoRemover: {
    fontSize: 14,
    fontWeight: "600",
  },
});
