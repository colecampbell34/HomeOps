import { useEffect, useState } from 'react';
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
import { Appliance, CreateSupplyInput, MaintenanceTask, Supply } from '../types';

type SupplyFormModalProps = {
  visible: boolean;
  appliances: Appliance[];
  tasks: MaintenanceTask[];
  initialSupply?: Supply;
  defaultApplianceId?: string;
  defaultTaskId?: string;
  onClose: () => void;
  onSubmit: (input: CreateSupplyInput) => Promise<void>;
};

export function SupplyFormModal({
  visible,
  appliances,
  tasks,
  initialSupply,
  defaultApplianceId,
  defaultTaskId,
  onClose,
  onSubmit,
}: SupplyFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Filter');
  const [sizeOrModel, setSizeOrModel] = useState('');
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [applianceId, setApplianceId] = useState<string | undefined>();
  const [taskId, setTaskId] = useState<string | undefined>();
  const [lastPurchasedAt, setLastPurchasedAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = name.trim().length > 0 && !isSaving;
  const isEditing = !!initialSupply;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialSupply?.name ?? '');
    setType(initialSupply?.type ?? 'Filter');
    setSizeOrModel(initialSupply?.sizeOrModel ?? '');
    setBrand(initialSupply?.brand ?? '');
    setNotes(initialSupply?.notes ?? '');
    setApplianceId(initialSupply?.applianceId ?? defaultApplianceId);
    setTaskId(initialSupply?.taskId ?? defaultTaskId);
    setLastPurchasedAt(initialSupply?.lastPurchasedAt ?? '');
  }, [defaultApplianceId, defaultTaskId, initialSupply, visible]);

  async function handleSubmit() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        type,
        sizeOrModel,
        brand,
        notes,
        applianceId,
        taskId,
        lastPurchasedAt,
      });
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
            <Text style={styles.eyebrow}>{isEditing ? 'Edit supply' : 'Add supply'}</Text>
            <Text style={styles.title}>Part record</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close supply form" onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field label="Name" value={name} onChangeText={setName} placeholder="Furnace filter" autoFocus />
          <View style={styles.twoColumn}>
            <Field label="Type" value={type} onChangeText={setType} placeholder="Filter" />
            <Field label="Size or model" value={sizeOrModel} onChangeText={setSizeOrModel} placeholder="16 x 25 x 1" />
          </View>
          <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Optional" />
          <Field label="Last purchased" value={lastPurchasedAt} onChangeText={setLastPurchasedAt} placeholder="YYYY-MM-DD or note" />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Linked appliance</Text>
            <View style={styles.chips}>
              <ChoiceChip label="None" selected={!applianceId} onPress={() => setApplianceId(undefined)} />
              {appliances.map((appliance) => (
                <ChoiceChip
                  key={appliance.id}
                  label={appliance.name}
                  selected={applianceId === appliance.id}
                  onPress={() => setApplianceId(appliance.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Linked task</Text>
            <View style={styles.chips}>
              <ChoiceChip label="None" selected={!taskId} onPress={() => setTaskId(undefined)} />
              {tasks.map((task) => (
                <ChoiceChip key={task.id} label={task.title} selected={taskId === task.id} onPress={() => setTaskId(task.id)} />
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Where it is stored or what you bought last time"
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
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving' : isEditing ? 'Save' : 'Add'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.fieldGroupHalf}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="words"
        autoFocus={autoFocus}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={2}>
        {label}
      </Text>
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
