import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const COLORS = {
  cardDark: '#212124',
  green: '#2FD98D',
  textWhite: '#FFFFFF',
  textGray: '#8A8A8E',
  greenDim: 'rgba(47,217,141,0.15)',
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

  function handlePress() {
    if (concluida) return;
    
    if (requerAnexo && onNavigate) {
      onNavigate();
      return;
    }

    if (onComplete) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start(() => onComplete());
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={requerAnexo && !concluida ? 0.7 : 1}
      onPress={requerAnexo && !concluida ? handlePress : undefined}
      style={[styles.taskCard, concluida && styles.taskCardDone]}
    >
      {/* Botão circular de completar ou ícone de IA */}
      <TouchableOpacity onPress={handlePress} disabled={concluida} activeOpacity={0.7}>
        <Animated.View
          style={[
            styles.checkCircle,
            concluida && styles.checkCircleDone,
            requerAnexo && !concluida && styles.checkCircleEvo,
            { transform: [{ scale }] },
          ]}
        >
          {concluida ? (
            <Ionicons name="checkmark" size={16} color="#fff" />
          ) : requerAnexo ? (
            <Ionicons name="hardware-chip-outline" size={16} color={COLORS.green} />
          ) : (
            <View style={styles.checkInner} />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Conteúdo da tarefa */}
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, concluida && styles.taskTitleDone]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.taskMeta}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textGray} />
          <Text style={styles.taskDate}>{date}</Text>
          {xpRecompensa !== undefined && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+{xpRecompensa} XP</Text>
            </View>
          )}
        </View>
      </View>

      {/* Pílula de status */}
      <View style={[styles.statusPill, concluida && styles.statusPillDone]}>
        <Text style={[styles.statusText, concluida && styles.statusTextDone]}>
          {concluida ? 'Feito' : (requerAnexo ? 'Requer IA' : 'Pendente')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4A4A4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  checkCircleEvo: {
    borderColor: 'rgba(47,217,141,0.5)',
    backgroundColor: 'rgba(47,217,141,0.1)',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textGray,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  taskDate: {
    fontSize: 11,
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
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.green,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillDone: {
    backgroundColor: COLORS.greenDim,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  statusTextDone: {
    color: COLORS.green,
  },
});

export default TaskItem;
