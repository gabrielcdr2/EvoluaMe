import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useAcessibilidade } from "@/contexts/AcessibilidadeContext";

const COLORS = {
  cardDark: "#212124",
  green: "#2FD98D",
  textWhite: "#FFFFFF",
  textGray: "#B0B0B5",
  greenDim: "rgba(47,217,141,0.15)",
};

interface TaskItemProps {
  title: string;
  date: string;
  xpRecompensa?: number;
  concluida?: boolean;
  requerAnexo?: boolean;
  onComplete?: () => void;
  onNavigate?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  title,
  date,
  xpRecompensa,
  concluida = false,
  requerAnexo = false,
  onComplete,
  onNavigate,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const { tamanhoFonte } = useAcessibilidade();

  const status = concluida
    ? "Concluída"
    : requerAnexo
      ? "Requer IA"
      : "Pendente";

  function handlePress() {
    if (concluida) return;

    if (requerAnexo && onNavigate) {
      onNavigate();
      return;
    }

    if (onComplete) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => onComplete());
    }
  }

  const descricaoTarefa = [
    title,
    `Status: ${status}`,
    date,
    xpRecompensa !== undefined
      ? `Recompensa: ${xpRecompensa} pontos de experiência`
      : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <View style={[styles.taskCard, concluida && styles.taskCardDone]}>
      {/* Botão de concluir ou abrir tarefa com anexo */}
      <TouchableOpacity
        onPress={handlePress}
        disabled={concluida}
        activeOpacity={0.7}
        style={styles.checkButton}
        accessibilityRole="button"
        accessibilityLabel={
          concluida
            ? `Tarefa ${title} concluída`
            : requerAnexo
              ? `Abrir tarefa ${title}`
              : `Concluir tarefa ${title}`
        }
        accessibilityHint={
          concluida
            ? undefined
            : requerAnexo
              ? "Abre os detalhes para realizar a tarefa que requer anexo"
              : "Marca esta tarefa como concluída e registra a recompensa"
        }
        accessibilityState={{
          disabled: concluida,
        }}
      >
        <Animated.View
          style={[
            styles.checkCircle,
            concluida && styles.checkCircleDone,
            requerAnexo && !concluida && styles.checkCircleEvo,
            { transform: [{ scale }] },
          ]}
        >
          {concluida ? (
            <Ionicons
              name="checkmark"
              size={16}
              color="#FFFFFF"
              accessible={false}
            />
          ) : requerAnexo ? (
            <Ionicons
              name="hardware-chip-outline"
              size={16}
              color={COLORS.green}
              accessible={false}
            />
          ) : (
            <View style={styles.checkInner} />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Informações da tarefa */}
      <View
        style={styles.taskContent}
        accessible
        accessibilityLabel={descricaoTarefa}
      >
        <Text
          style={[
            styles.taskTitle,
            concluida && styles.taskTitleDone,
            { fontSize: 14 * tamanhoFonte },
          ]}
        >
          {title}
        </Text>

        <View style={styles.taskMeta}>
          <Ionicons
            name="calendar-outline"
            size={12}
            color={COLORS.textGray}
            accessible={false}
          />

          <Text style={[styles.taskDate, { fontSize: 11 * tamanhoFonte }]}>
            {date}
          </Text>

          {xpRecompensa !== undefined && (
            <View style={styles.xpBadge}>
              <Text
                style={[styles.xpBadgeText, { fontSize: 10 * tamanhoFonte }]}
              >
                +{xpRecompensa} XP
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Indicador visual do status */}
      <View
        style={[styles.statusPill, concluida && styles.statusPillDone]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          style={[
            styles.statusText,
            concluida && styles.statusTextDone,
            { fontSize: 11 * tamanhoFonte },
          ]}
        >
          {concluida ? "Feito" : requerAnexo ? "Requer IA" : "Pendente"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 12,
  },

  taskCardDone: {
    opacity: 0.6,
  },

  checkButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#77777E",
    alignItems: "center",
    justifyContent: "center",
  },

  checkCircleDone: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  checkCircleEvo: {
    borderColor: "rgba(47,217,141,0.5)",
    backgroundColor: "rgba(47,217,141,0.1)",
  },

  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
  },

  taskContent: {
    flex: 1,
    minWidth: 0,
  },

  taskTitle: {
    fontWeight: "700",
    color: COLORS.textWhite,
    flexShrink: 1,
  },

  taskTitleDone: {
    textDecorationLine: "line-through",
    color: COLORS.textGray,
  },

  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },

  taskDate: {
    color: COLORS.textGray,
  },

  xpBadge: {
    backgroundColor: COLORS.greenDim,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 4,
  },

  xpBadgeText: {
    fontWeight: "700",
    color: COLORS.green,
  },

  statusPill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 1,
  },

  statusPillDone: {
    backgroundColor: COLORS.greenDim,
  },

  statusText: {
    color: COLORS.textGray,
    fontWeight: "600",
  },

  statusTextDone: {
    color: COLORS.green,
  },
});

export default TaskItem;
