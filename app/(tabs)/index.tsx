import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../src/components/EmptyState';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { QuickAddTaskModal } from '../../src/components/QuickAddTaskModal';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { formatShortDate } from '../../src/utils/dates';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    addTask,
    appliances,
    completeTask,
    error,
    getRoomName,
    home,
    isReady,
    lowStockSupplies,
    overdueTasks,
    recentCompletions,
    rooms,
    tasks,
    upcomingTasks,
  } = useHomeOps();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
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
  const hasAnyActivity = tasks.length > 0 || rooms.length > 0 || recentCompletions.length > 0;

  if (!isReady) {
    return (
      <Screen>
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Loading HomeOps</Text>
          <Text style={styles.emptyText}>Preparing your local home maintenance data.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {!!error && (
        <ErrorBanner title="Storage needs attention" message={error} />
      )}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{home.name}</Text>
          <Text style={styles.title}>Home dashboard</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick add task"
          onPress={() => setIsQuickAddOpen(true)}
          style={styles.quickAdd}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.statusCopy}>
          <Text style={styles.statusLabel}>Home status</Text>
          <Text style={styles.statusTitle}>{statusTone}</Text>
          <Text style={styles.statusText}>
            {hasAnyActivity
              ? `${overdueTasks.length} overdue · ${tasksDueSoon} due soon · ${lowStockSupplies.length} low stock`
              : 'Start by adding rooms, recurring tasks, or supplies you buy repeatedly.'}
          </Text>
        </View>
        <View style={styles.statusMeter}>
          <Text style={styles.statusNumber}>{Math.max(0, tasks.length - overdueTasks.length)}</Text>
          <Text style={styles.statusNumberLabel}>OK</Text>
        </View>
      </View>

      {!hasAnyActivity && (
        <View style={styles.tipPanel}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Good first setup steps</Text>
            <Text style={styles.tipText}>Add a room, then add one recurring task like testing smoke alarms or replacing a filter.</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsRow}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/seasonal')} style={styles.actionButton}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Seasonal</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/assets')} style={styles.actionButton}>
          <Ionicons name="cube-outline" size={18} color={colors.primary} />
          <Text style={styles.actionText}>Supplies</Text>
        </Pressable>
      </View>

      {lowStockSupplies.length > 0 && (
        <>
          <SectionHeader title="Low-stock supplies" count={lowStockSupplies.length} />
          {lowStockSupplies.slice(0, 3).map((supply) => (
            <Pressable
              key={supply.id}
              accessibilityRole="button"
              onPress={() => router.push(`/supply/${supply.id}`)}
              style={({ pressed }) => [styles.supplyRow, pressed && styles.supplyRowPressed]}
            >
              <View style={styles.supplyIcon}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.amber} />
              </View>
              <View style={styles.supplyText}>
                <Text style={styles.supplyTitle}>{supply.name}</Text>
                <Text style={styles.supplyMeta}>
                  Qty {formatQuantity(supply.quantityOnHand)} · low at {formatQuantity(supply.lowStockThreshold)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </>
      )}

      <SectionHeader title="Overdue" count={overdueTasks.length} />
      {overdueTasks.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title={tasks.length === 0 ? 'No tasks yet' : 'Nothing overdue'}
          body={
            tasks.length === 0
              ? 'Use the + button to add maintenance you want HomeOps to track.'
              : 'Upcoming work will stay visible here before it becomes urgent.'
          }
          actionLabel={tasks.length === 0 ? 'Add task' : undefined}
          onAction={tasks.length === 0 ? () => setIsQuickAddOpen(true) : undefined}
        />
      ) : (
        overdueTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            roomName={getRoomName(task.roomId)}
            onComplete={completeTask}
            onOpen={(taskId) => router.push(`/task/${taskId}`)}
          />
        ))
      )}

      <SectionHeader title="Upcoming" count={upcomingTasks.length} />
      {upcomingTasks.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No upcoming work"
          body="Recurring tasks will appear here once they have a next due date."
        />
      ) : (
        upcomingTasks.slice(0, 4).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            roomName={getRoomName(task.roomId)}
            onComplete={completeTask}
            onOpen={(taskId) => router.push(`/task/${taskId}`)}
          />
        ))
      )}

      <SectionHeader title="Recently completed" count={recentCompletions.length} />
      {recentCompletions.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No completion history"
          body="When you mark a task done, HomeOps keeps a simple record here."
        />
      ) : (
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
      )}

      <QuickAddTaskModal
        visible={isQuickAddOpen}
        rooms={rooms}
        appliances={appliances}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={addTask}
      />
    </Screen>
  );
}

function formatQuantity(value?: number): string {
  return typeof value === 'number' ? String(value) : 'not set';
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
  supplyRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 68,
    padding: spacing.lg,
  },
  supplyRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  supplyIcon: {
    alignItems: 'center',
    backgroundColor: colors.amberSurface,
    borderRadius: radii.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  supplyText: {
    flex: 1,
    gap: spacing.xs,
  },
  supplyTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  supplyMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  tipPanel: {
    alignItems: 'flex-start',
    backgroundColor: colors.amberSurface,
    borderColor: '#F1D2A9',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  tipIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  tipCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  tipTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  tipText: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
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
