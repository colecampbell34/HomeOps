import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radii, spacing } from '../theme';
import { Appliance, CreateMaintenanceTaskInput, MaintenanceTask, Priority, RecurrenceType, Room } from '../types';
import { addRecurrence, toISODate, today } from '../utils/dates';

type QuickAddTaskModalProps = {
  visible: boolean;
  rooms: Room[];
  appliances?: Appliance[];
  initialTask?: MaintenanceTask;
  defaultRoomId?: string;
  onClose: () => void;
  onSubmit: (input: CreateMaintenanceTaskInput) => Promise<void>;
};

type DuePreset = {
  label: string;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  dueDate: Date;
};

const priorityOptions: Priority[] = ['low', 'medium', 'high'];

const recurrenceOptions: Array<{ label: string; recurrenceType: RecurrenceType; recurrenceInterval: number }> = [
  { label: 'Weekly', recurrenceType: 'weekly', recurrenceInterval: 1 },
  { label: 'Monthly', recurrenceType: 'monthly', recurrenceInterval: 1 },
  { label: '3 months', recurrenceType: 'quarterly', recurrenceInterval: 1 },
  { label: '6 months', recurrenceType: 'semiannual', recurrenceInterval: 1 },
  { label: 'Yearly', recurrenceType: 'yearly', recurrenceInterval: 1 },
  { label: 'Custom', recurrenceType: 'custom', recurrenceInterval: 1 },
];

type CustomRecurrenceUnit = 'days' | 'weeks' | 'months' | 'years';

const customRecurrenceIndex = recurrenceOptions.length - 1;

const customUnitOptions: Array<{ label: string; unit: CustomRecurrenceUnit; recurrenceType: RecurrenceType }> = [
  { label: 'Days', unit: 'days', recurrenceType: 'custom' },
  { label: 'Weeks', unit: 'weeks', recurrenceType: 'weekly' },
  { label: 'Months', unit: 'months', recurrenceType: 'monthly' },
  { label: 'Years', unit: 'years', recurrenceType: 'yearly' },
];

function buildDuePresets(initialTask?: MaintenanceTask): DuePreset[] {
  const start = today();
  const currentDue = initialTask?.nextDueAt ? new Date(initialTask.nextDueAt) : undefined;

  const presets: DuePreset[] = [
    { label: currentDue ? 'Current due' : 'Today', recurrenceType: 'weekly', recurrenceInterval: 1, dueDate: currentDue ?? start },
    { label: '1 week', recurrenceType: 'weekly', recurrenceInterval: 1, dueDate: addRecurrence(start, 'weekly', 1) },
    { label: '1 month', recurrenceType: 'monthly', recurrenceInterval: 1, dueDate: addRecurrence(start, 'monthly', 1) },
    { label: '3 months', recurrenceType: 'quarterly', recurrenceInterval: 1, dueDate: addRecurrence(start, 'quarterly', 1) },
  ];

  return presets;
}

function unitFromRecurrenceType(recurrenceType: RecurrenceType): CustomRecurrenceUnit {
  if (recurrenceType === 'weekly') {
    return 'weeks';
  }

  if (recurrenceType === 'monthly' || recurrenceType === 'quarterly' || recurrenceType === 'semiannual') {
    return 'months';
  }

  if (recurrenceType === 'yearly') {
    return 'years';
  }

  return 'days';
}

function customIntervalFromTask(task: MaintenanceTask): string {
  if (task.recurrenceType === 'quarterly') {
    return String(task.recurrenceInterval * 3);
  }

  if (task.recurrenceType === 'semiannual') {
    return String(task.recurrenceInterval * 6);
  }

  return String(task.recurrenceInterval);
}

export function QuickAddTaskModal({
  visible,
  rooms,
  appliances = [],
  initialTask,
  defaultRoomId,
  onClose,
  onSubmit,
}: QuickAddTaskModalProps) {
  const duePresets = useMemo(() => buildDuePresets(initialTask), [initialTask, visible]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>();
  const [applianceId, setApplianceId] = useState<string | undefined>();
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrenceIndex, setRecurrenceIndex] = useState(1);
  const [customInterval, setCustomInterval] = useState('14');
  const [customUnit, setCustomUnit] = useState<CustomRecurrenceUnit>('days');
  const [duePresetIndex, setDuePresetIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = title.trim().length > 0 && !isSaving;
  const isEditing = !!initialTask;
  const isCustomRecurrence = recurrenceIndex === customRecurrenceIndex;

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (initialTask) {
      const recurrenceMatch = recurrenceOptions.findIndex(
        (option) =>
          option.recurrenceType === initialTask.recurrenceType &&
          option.recurrenceInterval === initialTask.recurrenceInterval,
      );

      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setNotes(initialTask.notes ?? '');
      setRoomId(initialTask.roomId);
      setApplianceId(initialTask.applianceId);
      setPriority(initialTask.priority);
      setRecurrenceIndex(recurrenceMatch >= 0 ? recurrenceMatch : customRecurrenceIndex);
      setCustomInterval(customIntervalFromTask(initialTask));
      setCustomUnit(unitFromRecurrenceType(initialTask.recurrenceType));
      setDuePresetIndex(0);
      return;
    }

    setTitle('');
    setCategory('General');
    setNotes('');
    setRoomId(defaultRoomId);
    setApplianceId(undefined);
    setPriority('medium');
    setRecurrenceIndex(1);
    setCustomInterval('14');
    setCustomUnit('days');
    setDuePresetIndex(0);
  }, [defaultRoomId, initialTask, visible]);

  function resetForm() {
    setTitle('');
    setCategory('General');
    setNotes('');
    setRoomId(defaultRoomId);
    setApplianceId(undefined);
    setPriority('medium');
    setRecurrenceIndex(1);
    setCustomInterval('14');
    setCustomUnit('days');
    setDuePresetIndex(0);
  }

  async function handleSubmit() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      const recurrence = recurrenceOptions[recurrenceIndex];
      const duePreset = duePresets[duePresetIndex];
      const normalizedCustomInterval = Math.max(1, Number.parseInt(customInterval, 10) || 1);
      const customRecurrenceType =
        customUnitOptions.find((option) => option.unit === customUnit)?.recurrenceType ?? 'custom';

      await onSubmit({
        title,
        roomId,
        applianceId,
        category,
        notes,
        priority,
        recurrenceType: isCustomRecurrence ? customRecurrenceType : recurrence.recurrenceType,
        recurrenceInterval: isCustomRecurrence ? normalizedCustomInterval : recurrence.recurrenceInterval,
        nextDueAt: toISODate(duePreset.dueDate),
      });

      resetForm();
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{isEditing ? 'Edit task' : 'Quick add'}</Text>
            <Text style={styles.title}>Maintenance task</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close quick add" onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Task name</Text>
            <TextInput
              autoFocus
              onChangeText={setTitle}
              placeholder="Replace furnace filter"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={title}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Room</Text>
            <View style={styles.chips}>
              <ChoiceChip
                label="Whole home"
                selected={!roomId}
                onPress={() => {
                  setRoomId(undefined);
                  setApplianceId(undefined);
                }}
              />
              {rooms.map((room) => (
                <ChoiceChip
                  key={room.id}
                  label={room.name}
                  selected={roomId === room.id}
                  onPress={() => {
                    setRoomId(room.id);
                    const selectedAppliance = appliances.find((appliance) => appliance.id === applianceId);

                    if (selectedAppliance?.roomId && selectedAppliance.roomId !== room.id) {
                      setApplianceId(undefined);
                    }
                  }}
                />
              ))}
            </View>
          </View>

          {appliances.length > 0 && (
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Linked appliance</Text>
              <View style={styles.chips}>
                <ChoiceChip label="None" selected={!applianceId} onPress={() => setApplianceId(undefined)} />
                {appliances.map((appliance) => (
                  <ChoiceChip
                    key={appliance.id}
                    label={appliance.name}
                    selected={applianceId === appliance.id}
                    onPress={() => {
                      setApplianceId(appliance.id);

                      if (appliance.roomId) {
                        setRoomId(appliance.roomId);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.twoColumn}>
            <View style={styles.fieldGroupHalf}>
              <Text style={styles.label}>Category</Text>
              <TextInput onChangeText={setCategory} style={styles.input} value={category} />
            </View>
            <View style={styles.fieldGroupHalf}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.segmented}>
                {priorityOptions.map((option) => (
                  <SegmentButton key={option} label={option} selected={priority === option} onPress={() => setPriority(option)} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Recurring schedule</Text>
            <View style={styles.chips}>
              {recurrenceOptions.map((option, index) => (
                <ChoiceChip
                  key={option.label}
                  label={option.label}
                  selected={recurrenceIndex === index}
                  onPress={() => setRecurrenceIndex(index)}
                />
              ))}
            </View>
          </View>

          {isCustomRecurrence && (
            <View style={styles.customRecurrenceRow}>
              <View style={styles.customIntervalField}>
                <Text style={styles.label}>Every</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setCustomInterval}
                  style={styles.input}
                  value={customInterval}
                />
              </View>
              <View style={styles.customUnitField}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.segmented}>
                  {customUnitOptions.map((option) => (
                    <SegmentButton
                      key={option.unit}
                      label={option.label}
                      selected={customUnit === option.unit}
                      onPress={() => setCustomUnit(option.unit)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Next due</Text>
            <View style={styles.chips}>
              {duePresets.map((preset, index) => (
                <ChoiceChip
                  key={preset.label}
                  label={preset.label}
                  selected={duePresetIndex === index}
                  onPress={() => setDuePresetIndex(index)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Part size, location, or short instructions"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.notesInput]}
              value={notes}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.primaryButton, (!canSave || pressed) && styles.primaryButtonMuted]}
          >
            <Ionicons name="add" size={17} color={colors.white} />
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving' : isEditing ? 'Save task' : 'Add task'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function SegmentButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.segment, selected && styles.segmentSelected]}>
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
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
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldGroupHalf: {
    flex: 1,
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: font.body,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  notesInput: {
    minHeight: 92,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
  },
  chipTextSelected: {
    color: colors.white,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  customRecurrenceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  customIntervalField: {
    gap: spacing.sm,
    width: 94,
  },
  customUnitField: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    flexDirection: 'row',
    padding: 3,
  },
  segment: {
    alignItems: 'center',
    borderRadius: radii.sm,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.surface,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  segmentTextSelected: {
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonMuted: {
    opacity: 0.58,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: font.body,
    fontWeight: '800',
  },
});
