import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

export default function TasksScreen() {
  const { completeTask, getRoomName, overdueTasks, upcomingTasks } = useHomeOps();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.subtitle}>A working list of the home maintenance schedule.</Text>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterActive}>
          <Text style={styles.filterActiveText}>Upcoming</Text>
        </View>
        <View style={styles.filter}>
          <Text style={styles.filterText}>Overdue</Text>
        </View>
        <View style={styles.filter}>
          <Text style={styles.filterText}>Completed</Text>
        </View>
      </View>

      <SectionHeader title="Needs attention" count={overdueTasks.length} />
      {overdueTasks.map((task) => (
        <TaskCard key={task.id} task={task} roomName={getRoomName(task.roomId)} onComplete={completeTask} />
      ))}

      <SectionHeader title="Scheduled" count={upcomingTasks.length} />
      {upcomingTasks.map((task) => (
        <TaskCard key={task.id} task={task} roomName={getRoomName(task.roomId)} onComplete={completeTask} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
});
