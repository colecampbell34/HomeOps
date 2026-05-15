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
import { Appliance, CreateApplianceInput, Room } from '../types';

type ApplianceFormModalProps = {
  visible: boolean;
  rooms: Room[];
  initialAppliance?: Appliance;
  defaultRoomId?: string;
  onClose: () => void;
  onSubmit: (input: CreateApplianceInput) => Promise<void>;
};

export function ApplianceFormModal({
  visible,
  rooms,
  initialAppliance,
  defaultRoomId,
  onClose,
  onSubmit,
}: ApplianceFormModalProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>();
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseVendor, setPurchaseVendor] = useState('');
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = name.trim().length > 0 && !isSaving;
  const isEditing = !!initialAppliance;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(initialAppliance?.name ?? '');
    setRoomId(initialAppliance?.roomId ?? defaultRoomId);
    setBrand(initialAppliance?.brand ?? '');
    setModelNumber(initialAppliance?.modelNumber ?? '');
    setSerialNumber(initialAppliance?.serialNumber ?? '');
    setPurchaseDate(initialAppliance?.purchaseDate ?? '');
    setPurchaseVendor(initialAppliance?.purchaseVendor ?? '');
    setWarrantyExpiresAt(initialAppliance?.warrantyExpiresAt ?? '');
    setReceiptUrl(initialAppliance?.receiptUrl ?? '');
    setManualUrl(initialAppliance?.manualUrl ?? '');
    setNotes(initialAppliance?.notes ?? '');
  }, [defaultRoomId, initialAppliance, visible]);

  async function handleSubmit() {
    if (!canSave) {
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name,
        roomId,
        brand,
        modelNumber,
        serialNumber,
        purchaseDate,
        purchaseVendor,
        warrantyExpiresAt,
        receiptUrl,
        manualUrl,
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
            <Text style={styles.eyebrow}>{isEditing ? 'Edit appliance' : 'Add appliance'}</Text>
            <Text style={styles.title}>Equipment record</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close appliance form" onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Field label="Name" value={name} onChangeText={setName} placeholder="Furnace" autoFocus />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Room</Text>
            <View style={styles.chips}>
              <ChoiceChip label="Unassigned" selected={!roomId} onPress={() => setRoomId(undefined)} />
              {rooms.map((room) => (
                <ChoiceChip key={room.id} label={room.name} selected={roomId === room.id} onPress={() => setRoomId(room.id)} />
              ))}
            </View>
          </View>

          <View style={styles.twoColumn}>
            <Field label="Brand" value={brand} onChangeText={setBrand} placeholder="Carrier" />
            <Field label="Model" value={modelNumber} onChangeText={setModelNumber} placeholder="59TP6B" />
          </View>

          <Field label="Serial number" value={serialNumber} onChangeText={setSerialNumber} placeholder="Optional" />
          <View style={styles.twoColumn}>
            <Field label="Purchase date" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD or note" />
            <Field label="Vendor" value={purchaseVendor} onChangeText={setPurchaseVendor} placeholder="Store or installer" />
          </View>
          <Field label="Warranty expires" value={warrantyExpiresAt} onChangeText={setWarrantyExpiresAt} placeholder="YYYY-MM-DD or note" />
          <Field label="Receipt URL" value={receiptUrl} onChangeText={setReceiptUrl} placeholder="https://..." autoCapitalize="none" />
          <Field label="Manual URL" value={manualUrl} onChangeText={setManualUrl} placeholder="https://..." autoCapitalize="none" />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              multiline
              onChangeText={setNotes}
              placeholder="Filter location, reset steps, warranty note"
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
  autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={styles.fieldGroupHalf}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
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
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
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
