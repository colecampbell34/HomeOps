import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../src/components/EmptyState';
import { QuickAddTaskModal } from '../../src/components/QuickAddTaskModal';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { formatShortDate } from '../../src/utils/dates';

type TaskFilter = 'upcoming' | 'overdue' | 'completed' | `room:${string}`;

export default function TasksScreen() {
  const router = useRouter();
  const { addTask, completeTask, completions, getRoomName, isReady, overdueTasks, rooms, tasks, upcomingTasks } = useHomeOps();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TaskFilter>('upcoming');

  const completedItems = useMemo(
    () =>
      completions
        .map((completion) => ({
          ...completion,
          task: tasks.find((task) => task.id === completion.taskId),
        }))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
    [completions, tasks],
  );

  const visibleTasks = useMemo(() => {
    if (selectedFilter === 'overdue') {
      return overdueTasks;
    }

    if (selectedFilter.startsWith('room:')) {
      const roomId = selectedFilter.replace('room:', '');
      return tasks.filter((task) => task.roomId === roomId);
    }

    return upcomingTasks;
  }, [overdueTasks, selectedFilter, tasks, upcomingTasks]);

  const selectedRoom = selectedFilter.startsWith('room:')
    ? rooms.find((room) => room.id === selectedFilter.replace('room:', ''))
    : undefined;
  const sectionTitle =
    selectedFilter === 'overdue' ? 'Needs attention' : selectedRoom ? selectedRoom.name : 'Scheduled';

  if (!isReady) {
    return (
      <Screen>
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Loading tasks</Text>
          <Text style={styles.subtitle}>Preparing your local task schedule.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Tasks</Text>
          <Text style={styles.subtitle}>A working list of the home maintenance schedule.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quick add task"
          onPress={() => setIsQuickAddOpen(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={16} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.filterRow} showsHorizontalScrollIndicator={false}>
        <FilterChip label="Upcoming" selected={selectedFilter === 'upcoming'} onPress={() => setSelectedFilter('upcoming')} />
        <FilterChip label="Overdue" selected={selectedFilter === 'overdue'} onPress={() => setSelectedFilter('overdue')} />
        <FilterChip label="Completed" selected={selectedFilter === 'completed'} onPress={() => setSelectedFilter('completed')} />
        {rooms.map((room) => (
          <FilterChip
            key={room.id}
            label={room.name}
            selected={selectedFilter === `room:${room.id}`}
            onPress={() => setSelectedFilter(`room:${room.id}`)}
          />
        ))}
      </ScrollView>

      {selectedFilter === 'completed' ? (
        <>
          <SectionHeader title="Completed" count={completedItems.length} />
          {completedItems.length === 0 ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title="No completed tasks"
              body="Completed maintenance will appear here with the date it was finished."
            />
          ) : (
            <View style={styles.historyList}>
              {completedItems.map((completion) => (
                <View key={completion.id} style={styles.historyRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons name="checkmark" size={15} color={colors.primary} />
                  </View>
                  <View style={styles.historyText}>
                    <Text style={styles.historyTitle}>{completion.task?.title ?? 'Maintenance task'}</Text>
                    <Text style={styles.historyMeta}>{formatShortDate(completion.completedAt)}</Text>
                    {!!completion.notes && <Text style={styles.historyNotes}>{completion.notes}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <>
          <SectionHeader title={sectionTitle} count={visibleTasks.length} />
          {visibleTasks.length === 0 ? (
            <EmptyState
              icon={selectedFilter === 'overdue' ? 'checkmark-circle-outline' : 'calendar-outline'}
              title={selectedFilter === 'overdue' ? 'No overdue tasks' : 'No tasks found'}
              body={
                selectedFilter === 'overdue'
                  ? 'Tasks that slip past their due date will appear here.'
                  : 'Add recurring maintenance tasks so HomeOps can surface what needs attention next.'
              }
              actionLabel="Add task"
              onAction={() => setIsQuickAddOpen(true)}
            />
          ) : (
            visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                roomName={getRoomName(task.roomId)}
                onComplete={completeTask}
                onOpen={(taskId) => router.push(`/task/${taskId}`)}
              />
            ))
          )}
        </>
      )}

      <QuickAddTaskModal
        visible={isQuickAddOpen}
        rooms={rooms}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={addTask}
      />
    </Screen>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.filter, selected && styles.filterActive]}>
      <Text style={[styles.filterText, selected && styles.filterActiveText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 21,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filter: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterActiveText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '800',
  },
  filterText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
  },
  historyList: {
    gap: spacing.sm,
  },
  historyRow: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  historyIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  historyText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  historyTitle: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
  },
  historyMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
  historyNotes: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
});
