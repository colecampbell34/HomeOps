import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radii, spacing } from '../theme';
import { MaintenanceTask } from '../types';
import { dueLabel, formatShortDate, getTaskStatus } from '../utils/dates';

type TaskCardProps = {
  task: MaintenanceTask;
  roomName: string;
  onComplete?: (taskId: string) => void;
};

const statusStyles = {
  overdue: {
    backgroundColor: colors.redSurface,
    color: colors.red,
    borderColor: '#F1C7C0',
  },
  'due-soon': {
    backgroundColor: colors.amberSurface,
    color: colors.amber,
    borderColor: '#EACB9A',
  },
  upcoming: {
    backgroundColor: colors.greenSurface,
    color: colors.primary,
    borderColor: '#C7DACD',
  },
  complete: {
    backgroundColor: colors.greenSurface,
    color: colors.primary,
    borderColor: '#C7DACD',
  },
  unscheduled: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textMuted,
    borderColor: colors.border,
  },
};

export function TaskCard({ task, roomName, onComplete }: TaskCardProps) {
  const status = getTaskStatus(task);
  const statusStyle = statusStyles[status];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.meta}>
            {roomName} · {task.category} · {formatShortDate(task.nextDueAt)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
          <Text style={[styles.badgeText, { color: statusStyle.color }]}>{dueLabel(task.nextDueAt)}</Text>
        </View>
      </View>

      {!!task.notes && <Text style={styles.notes}>{task.notes}</Text>}

      <View style={styles.footer}>
        <View style={styles.priority}>
          <Ionicons name="flag-outline" size={14} color={colors.textMuted} />
          <Text style={styles.priorityText}>{task.priority} priority</Text>
        </View>

        {!!onComplete && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Complete ${task.title}`}
            onPress={() => onComplete(task.id)}
            style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
          >
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.completeButtonText}>Done</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
  badge: {
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: font.tiny,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notes: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priority: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priorityText: {
    color: colors.textMuted,
    fontSize: font.small,
    textTransform: 'capitalize',
  },
  completeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  completeButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '700',
  },
});
