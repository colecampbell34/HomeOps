import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { QuickAddTaskModal } from '../../src/components/QuickAddTaskModal';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SupplyFormModal } from '../../src/components/SupplyFormModal';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { addRecurrence, dueLabel, formatLongDate, recurrenceLabel, toISODate, today } from '../../src/utils/dates';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    addSupply,
    appliances,
    archiveTask,
    completeTask,
    completions,
    getApplianceName,
    getRoomName,
    rooms,
    supplies,
    tasks,
    updateTask,
    rescheduleTask,
  } = useHomeOps();
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSupplyFormOpen, setIsSupplyFormOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [snoozingLabel, setSnoozingLabel] = useState<string | undefined>();

  const task = tasks.find((candidate) => candidate.id === id);
  const taskHistory = useMemo(
    () =>
      completions
        .filter((completion) => completion.taskId === id)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
    [completions, id],
  );
  const linkedSupplies = supplies.filter((supply) => supply.taskId === id);

  async function handleComplete() {
    if (!task || isCompleting) {
      return;
    }

    setIsCompleting(true);

    try {
      await completeTask(task.id, completionNotes.trim() || undefined);
      setCompletionNotes('');
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleSnooze(label: string, nextDueAt: string) {
    if (!task || snoozingLabel) {
      return;
    }

    setSnoozingLabel(label);

    try {
      await rescheduleTask(task.id, nextDueAt);
    } finally {
      setSnoozingLabel(undefined);
    }
  }

  async function handleArchive() {
    if (!task || isArchiving) {
      return;
    }

    if (!confirmArchive) {
      setConfirmArchive(true);
      return;
    }

    setIsArchiving(true);

    try {
      await archiveTask(task.id);
      router.replace('/(tabs)/tasks');
    } finally {
      setIsArchiving(false);
    }
  }

  if (!task) {
    return (
      <Screen>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Task not found</Text>
          <Text style={styles.emptyText}>This task may have been archived or removed.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit task" onPress={() => setIsEditing(true)} style={styles.editButton}>
          <Ionicons name="create-outline" size={17} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{getRoomName(task.roomId)}</Text>
        <Text style={styles.title}>{task.title}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{dueLabel(task.nextDueAt)}</Text>
          </View>
          <View style={styles.neutralBadge}>
            <Text style={styles.neutralBadgeText}>{task.priority} priority</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <InfoCell label="Next due" value={formatLongDate(task.nextDueAt)} />
        <InfoCell label="Last done" value={formatLongDate(task.lastCompletedAt)} />
        <InfoCell label="Schedule" value={recurrenceLabel(task.recurrenceType, task.recurrenceInterval)} />
        <InfoCell label="Appliance" value={getApplianceName(task.applianceId)} />
      </View>

      <View style={styles.detailGrid}>
        <InfoCell label="Category" value={task.category} />
        <InfoCell label="Supplies" value={`${linkedSupplies.length} linked`} />
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.blockTitle}>Schedule actions</Text>
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            disabled={!!snoozingLabel}
            onPress={() => handleSnooze('1 week', toISODate(addRecurrence(today(), 'weekly', 1)))}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
          >
            <Ionicons name="time-outline" size={17} color={colors.primary} />
            <Text style={styles.secondaryActionText}>{snoozingLabel === '1 week' ? 'Saving' : 'Snooze 1 week'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!!snoozingLabel}
            onPress={() => handleSnooze('1 month', toISODate(addRecurrence(today(), 'monthly', 1)))}
            style={({ pressed }) => [styles.secondaryAction, pressed && styles.secondaryActionPressed]}
          >
            <Ionicons name="calendar-outline" size={17} color={colors.primary} />
            <Text style={styles.secondaryActionText}>{snoozingLabel === '1 month' ? 'Saving' : 'Snooze 1 month'}</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleArchive}
          style={({ pressed }) => [styles.archiveButton, pressed && styles.archiveButtonPressed]}
        >
          <Ionicons name={confirmArchive ? 'alert-circle-outline' : 'archive-outline'} size={17} color={colors.red} />
          <Text style={styles.archiveButtonText}>
            {isArchiving ? 'Archiving' : confirmArchive ? 'Confirm archive task' : 'Archive task'}
          </Text>
        </Pressable>
      </View>

      {!!task.notes && (
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>Notes</Text>
          <Text style={styles.blockText}>{task.notes}</Text>
        </View>
      )}

      <View style={styles.sectionBlock}>
        <Text style={styles.blockTitle}>Complete task</Text>
        <TextInput
          multiline
          onChangeText={setCompletionNotes}
          placeholder="Optional completion note"
          placeholderTextColor={colors.textMuted}
          style={styles.notesInput}
          value={completionNotes}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isCompleting}
          onPress={handleComplete}
          style={({ pressed }) => [styles.primaryButton, (pressed || isCompleting) && styles.primaryButtonPressed]}
        >
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.primaryButtonText}>{isCompleting ? 'Completing' : 'Mark complete'}</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeaderRow}>
        <SectionHeader title="Supplies" count={linkedSupplies.length} />
        <Pressable accessibilityRole="button" onPress={() => setIsSupplyFormOpen(true)} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Add</Text>
        </Pressable>
      </View>
      {linkedSupplies.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No linked supplies</Text>
          <Text style={styles.emptyText}>Add a filter, battery, part, or supply used by this task.</Text>
        </View>
      ) : (
        linkedSupplies.map((supply) => (
          <Pressable
            key={supply.id}
            accessibilityRole="button"
            onPress={() => router.push(`/supply/${supply.id}`)}
            style={styles.supplyRow}
          >
            <Text style={styles.supplyTitle}>{supply.name}</Text>
            <Text style={styles.supplyMeta}>{supply.sizeOrModel || supply.type}</Text>
          </Pressable>
        ))
      )}

      <SectionHeader title="Completion history" count={taskHistory.length} />
      <View style={styles.historyList}>
        {taskHistory.length === 0 ? (
          <View style={styles.historyRow}>
            <Text style={styles.emptyText}>No completions recorded yet.</Text>
          </View>
        ) : (
          taskHistory.map((completion) => (
            <View key={completion.id} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Ionicons name="checkmark" size={15} color={colors.primary} />
              </View>
              <View style={styles.historyText}>
                <Text style={styles.historyTitle}>{formatLongDate(completion.completedAt)}</Text>
                {!!completion.notes && <Text style={styles.historyMeta}>{completion.notes}</Text>}
              </View>
            </View>
          ))
        )}
      </View>

      <QuickAddTaskModal
        visible={isEditing}
        rooms={rooms}
        appliances={appliances}
        initialTask={task}
        onClose={() => setIsEditing(false)}
        onSubmit={(input) => updateTask(task.id, input)}
      />

      <SupplyFormModal
        visible={isSupplyFormOpen}
        appliances={appliances}
        tasks={tasks}
        defaultTaskId={task.id}
        onClose={() => setIsSupplyFormOpen(false)}
        onSubmit={addSupply}
      />
    </Screen>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusBadge: {
    backgroundColor: colors.amberSurface,
    borderColor: '#EACB9A',
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  statusBadgeText: {
    color: colors.amber,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  neutralBadge: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  neutralBadgeText: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoCell: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: '45%',
    gap: spacing.xs,
    minHeight: 78,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
    lineHeight: 18,
  },
  sectionBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  sectionHeaderRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  smallButtonText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  supplyRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
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
  blockTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  blockText: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  secondaryActionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  archiveButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#F1C7C0',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  archiveButtonPressed: {
    backgroundColor: colors.redSurface,
  },
  archiveButtonText: {
    color: colors.red,
    fontSize: font.small,
    fontWeight: '800',
  },
  notesInput: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: font.body,
    minHeight: 86,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: font.body,
    fontWeight: '800',
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
    minHeight: 60,
    padding: spacing.lg,
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
    gap: spacing.xs,
  },
  historyTitle: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
  },
  historyMeta: {
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
  },
});
