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
import { CreateRoomInput, Room } from '../types';

type RoomOption = {
  label: string;
  type: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const roomOptions: RoomOption[] = [
  { label: 'Kitchen', type: 'kitchen', icon: 'restaurant-outline' },
  { label: 'Bathroom', type: 'bathroom', icon: 'water-outline' },
  { label: 'Bedroom', type: 'bedroom', icon: 'bed-outline' },
  { label: 'Laundry', type: 'laundry', icon: 'shirt-outline' },
  { label: 'Garage', type: 'garage', icon: 'car-outline' },
  { label: 'Basement', type: 'basement', icon: 'layers-outline' },
  { label: 'Exterior', type: 'exterior', icon: 'home-outline' },
  { label: 'HVAC / Utility', type: 'hvac', icon: 'thermometer-outline' },
  { label: 'Custom', type: 'custom', icon: 'grid-outline' },
];

type RoomFormModalProps = {
  visible: boolean;
  initialRoom?: Room;
  onClose: () => void;
  onSubmit: (input: CreateRoomInput) => Promise<void>;
};

export function RoomFormModal({ visible, initialRoom, onClose, onSubmit }: RoomFormModalProps) {
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState(roomOptions[0]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const canSave = name.trim().length > 0 && !isSaving;
  const isEditing = !!initialRoom;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialRoom?.name ?? '');
    setSelectedType(roomOptions.find((option) => option.type === initialRoom?.type) ?? roomOptions[0]);
    setNotes(initialRoom?.notes ?? '');
  }, [initialRoom, visible]);

  async function handleSubmit() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        type: selectedType.type,
        icon: selectedType.icon,
        notes,
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
            <Text style={styles.eyebrow}>{isEditing ? 'Edit room' : 'New room'}</Text>
            <Text style={styles.title}>Room or area</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close room form" onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              autoFocus={!isEditing}
              onChangeText={setName}
              placeholder="Garage, basement, guest bath"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              value={name}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.optionGrid}>
              {roomOptions.map((option) => (
                <Pressable
                  key={option.type}
                  accessibilityRole="button"
                  onPress={() => setSelectedType(option)}
                  style={[styles.option, selectedType.type === option.type && styles.optionSelected]}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={selectedType.type === option.type ? colors.white : colors.primary}
                  />
                  <Text style={[styles.optionText, selectedType.type === option.type && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Storage locations, shutoffs, quirks, or useful room details"
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
            <Ionicons name={isEditing ? 'checkmark' : 'add'} size={17} color={colors.white} />
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving' : isEditing ? 'Save room' : 'Add room'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  },
  fieldGroup: {
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
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  notesInput: {
    minHeight: 94,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: colors.white,
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
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonMuted: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: font.body,
    fontWeight: '800',
  },
});
