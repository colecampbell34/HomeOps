import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ApplianceFormModal } from '../../src/components/ApplianceFormModal';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SupplyFormModal } from '../../src/components/SupplyFormModal';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { formatLongDate } from '../../src/utils/dates';

export default function ApplianceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    addSupply,
    appliances,
    completeTask,
    getRoomName,
    rooms,
    supplies,
    tasks,
    updateAppliance,
  } = useHomeOps();
  const [isEditing, setIsEditing] = useState(false);
  const [isSupplyFormOpen, setIsSupplyFormOpen] = useState(false);

  const appliance = appliances.find((candidate) => candidate.id === id);
  const linkedTasks = tasks.filter((task) => task.applianceId === id || task.roomId === appliance?.roomId);
  const linkedSupplies = supplies.filter((supply) => supply.applianceId === id);

  if (!appliance) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} />
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Appliance not found</Text>
          <Text style={styles.emptyText}>This appliance may have been removed.</Text>
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
          <Ionicons name="build-outline" size={28} color={colors.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>{getRoomName(appliance.roomId)}</Text>
          <Text style={styles.title}>{appliance.name}</Text>
          <Text style={styles.subtitle}>
            {appliance.brand || 'Brand not set'} {appliance.modelNumber ? `· ${appliance.modelNumber}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <InfoCell label="Model" value={appliance.modelNumber || 'Not set'} />
        <InfoCell label="Serial" value={appliance.serialNumber || 'Not set'} />
        <InfoCell label="Purchase date" value={appliance.purchaseDate ? formatLongDate(appliance.purchaseDate) : 'Not set'} />
        <InfoCell label="Supplies" value={`${linkedSupplies.length} linked`} />
      </View>

      {!!appliance.manualUrl && (
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(appliance.manualUrl!)} style={styles.linkBlock}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <View style={styles.linkText}>
            <Text style={styles.blockTitle}>Manual link</Text>
            <Text style={styles.blockText} numberOfLines={2}>
              {appliance.manualUrl}
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </Pressable>
      )}

      {!!appliance.notes && (
        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>Notes</Text>
          <Text style={styles.blockText}>{appliance.notes}</Text>
        </View>
      )}

      <View style={styles.sectionHeaderRow}>
        <SectionHeader title="Supplies" count={linkedSupplies.length} />
        <Pressable accessibilityRole="button" onPress={() => setIsSupplyFormOpen(true)} style={styles.smallButton}>
          <Text style={styles.smallButtonText}>Add</Text>
        </Pressable>
      </View>
      {linkedSupplies.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No linked supplies</Text>
          <Text style={styles.emptyText}>Add filters, batteries, bulbs, or parts used by this appliance.</Text>
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

      <SectionHeader title="Related room tasks" count={linkedTasks.length} />
      {linkedTasks.slice(0, 4).map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          roomName={getRoomName(task.roomId)}
          onComplete={completeTask}
          onOpen={(taskId) => router.push(`/task/${taskId}`)}
        />
      ))}

      <ApplianceFormModal
        visible={isEditing}
        rooms={rooms}
        initialAppliance={appliance}
        onClose={() => setIsEditing(false)}
        onSubmit={(input) => updateAppliance(appliance.id, input)}
      />

      <SupplyFormModal
        visible={isSupplyFormOpen}
        appliances={appliances}
        tasks={tasks}
        defaultApplianceId={appliance.id}
        onClose={() => setIsSupplyFormOpen(false)}
        onSubmit={addSupply}
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
  linkBlock: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  linkText: {
    flex: 1,
    gap: spacing.xs,
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
