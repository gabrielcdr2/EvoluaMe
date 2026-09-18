import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import CircularProgress from './CircularProgress';

const COLORS = {
  cardDark: '#212124',
  green: '#2FD98D',
  textWhite: '#FFFFFF',
  textGray: '#8A8A8E',
};

interface TaskItemProps {
  title: string;
  date: string;
  inProgress?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ title, date, inProgress }) => (
  <View style={styles.taskCard}>
    <View style={styles.taskLeft}>
      {inProgress ? (
        <CircularProgress
          size={26}
          strokeWidth={3}
          progress={35}
          trackColor="#3A3A3D"
          progressColor={COLORS.green}
        />
      ) : (
        <View style={styles.taskCircleEmpty} />
      )}
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.taskTitle}>{title}</Text>
        <View style={styles.taskDateRow}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.textGray} />
          <Text style={styles.taskDate}>{date}</Text>
        </View>
      </View>
    </View>
    <View style={styles.taskPill} />
  </View>
);

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCircleEmpty: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#4A4A4D',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  taskDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  taskDate: {
    fontSize: 11,
    color: COLORS.textGray,
    marginLeft: 4,
  },
  taskPill: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
  },
});

export default TaskItem;
