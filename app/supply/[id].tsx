import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '../../src/components/Screen';
import { SupplyFormModal } from '../../src/components/SupplyFormModal';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { formatLongDate } from '../../src/utils/dates';

export default function SupplyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appliances, getApplianceName, getTaskTitle, supplies, tasks, updateSupply } = useHomeOps();
  const [isEditing, setIsEditing] = useState(false);

  const supply = supplies.find((candidate) => candidate.id === id);

  if (!supply) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} />
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Supply not found</Text>
          <Text style={styles.emptyText}>This supply may have been removed.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} />
        <Pressable accessibilityRole="button" onPress={() => setIsEditing(true)} style={styles.editButton}>
          <Ionicons name="create-outline" size={17} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="cube-outline" size={28} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>{supply.type}</Text>
          <Text style={styles.title}>{supply.name}</Text>
          <Text style={styles.subtitle}>{supply.sizeOrModel || 'Size/model not set'}</Text>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <InfoCell label="Brand" value={supply.brand || 'Not set'} />
        <InfoCell label="Last purchased" value={supply.lastPurchasedAt ? formatLongDate(supply.lastPurchasedAt) : 'Not set'} />
        <InfoCell label="Appliance" value={getApplianceName(supply.applianceId)} />
        <InfoCell label="Task" value={getTaskTitle(supply.taskId)} />
      </View>

      {!!supply.applianceId && (
        <Pressable accessibilityRole="button" onPress={() => router.push(`/appliance/${supply.applianceId}`)} style={styles.linkRow}>
          <Ionicons name="build-outline" size={19} color={colors.primary} />
          <Text style={styles.linkText}>Open {getApplianceName(supply.applianceId)}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {!!supply.taskId && (
        <Pressable accessibilityRole="button" onPress={() => router.push(`/task/${supply.taskId}`)} style={styles.linkRow}>
          <Ionicons name="checkbox-outline" size={19} color={colors.primary} />
          <Text style={styles.linkText}>Open linked task</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {!!supply.notes && (
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>Notes</Text>
          <Text style={styles.blockText}>{supply.notes}</Text>
        </View>
      )}

      <SupplyFormModal
        visible={isEditing}
        appliances={appliances}
        tasks={tasks}
        initialSupply={supply}
        onClose={() => setIsEditing(false)}
        onSubmit={(input) => updateSupply(supply.id, input)}
      />
    </Screen>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onPress} style={styles.iconButton}>
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
    textTransform: 'uppercase',
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
    flexBasis: '45%',
    flexGrow: 1,
    gap: spacing.xs,
    minHeight: 76,
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
  linkRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
  },
  linkText: {
    color: colors.primary,
    flex: 1,
    fontSize: font.body,
    fontWeight: '800',
  },
  sectionBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  blockTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  blockText: {
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
});
