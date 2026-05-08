import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { formatShortDate } from '../../src/utils/dates';

export default function DashboardScreen() {
  const { completeTask, getRoomName, home, overdueTasks, recentCompletions, tasks, upcomingTasks } = useHomeOps();
  const tasksDueSoon = upcomingTasks.filter((task) => {
    if (!task.nextDueAt) {
      return false;
    }

    const due = new Date(task.nextDueAt);
    const now = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(now.getDate() + 14);

    return due <= inTwoWeeks;
  }).length;

  const statusTone = overdueTasks.length > 0 ? 'Needs attention' : tasksDueSoon > 0 ? 'On track' : 'Steady';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{home.name}</Text>
          <Text style={styles.title}>Home dashboard</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Quick add task" style={styles.quickAdd}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>Home status</Text>
          <Text style={styles.statusTitle}>{statusTone}</Text>
          <Text style={styles.statusText}>
            {overdueTasks.length} overdue · {tasksDueSoon} due soon · {tasks.length} active tasks
          </Text>
        </View>
        <View style={styles.statusMeter}>
          <Text style={styles.statusNumber}>{Math.max(0, tasks.length - overdueTasks.length)}</Text>
          <Text style={styles.statusNumberLabel}>OK</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable accessibilityRole="button" style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Seasonal</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.actionButton}>
          <Ionicons name="cube-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Supplies</Text>
        </Pressable>
      </View>

      <SectionHeader title="Overdue" count={overdueTasks.length} />
      {overdueTasks.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Nothing overdue</Text>
          <Text style={styles.emptyText}>Upcoming work will stay visible here before it becomes urgent.</Text>
        </View>
      ) : (
        overdueTasks.map((task) => (
          <TaskCard key={task.id} task={task} roomName={getRoomName(task.roomId)} onComplete={completeTask} />
        ))
      )}

      <SectionHeader title="Upcoming" count={upcomingTasks.length} />
      {upcomingTasks.slice(0, 4).map((task) => (
        <TaskCard key={task.id} task={task} roomName={getRoomName(task.roomId)} onComplete={completeTask} />
      ))}

      <SectionHeader title="Recently completed" count={recentCompletions.length} />
      <View style={styles.historyList}>
        {recentCompletions.map((completion) => (
          <View key={completion.id} style={styles.historyRow}>
            <View style={styles.historyIcon}>
              <Ionicons name="checkmark" size={15} color={colors.primary} />
            </View>
            <View style={styles.historyText}>
              <Text style={styles.historyTitle}>{completion.task?.title ?? 'Maintenance task'}</Text>
              <Text style={styles.historyMeta}>{formatShortDate(completion.completedAt)}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
  },
  quickAdd: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  statusPanel: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  statusCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  statusLabel: {
    color: '#BFD1C7',
    fontSize: font.small,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  statusText: {
    color: '#DDE8E2',
    fontSize: font.small,
    lineHeight: 19,
  },
  statusMeter: {
    alignItems: 'center',
    backgroundColor: '#31564A',
    borderRadius: radii.md,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: spacing.md,
  },
  statusNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
  },
  statusNumberLabel: {
    color: '#DDE8E2',
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  emptyBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  historyList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  historyIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.sm,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  historyText: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
});
