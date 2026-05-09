import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ApplianceFormModal } from '../../src/components/ApplianceFormModal';
import { QuickAddTaskModal } from '../../src/components/QuickAddTaskModal';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { SupplyFormModal } from '../../src/components/SupplyFormModal';
import { TaskCard } from '../../src/components/TaskCard';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { getTaskStatus } from '../../src/utils/dates';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addAppliance, addSupply, appliances, completeTask, rooms, supplies, tasks, addTask } = useHomeOps();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [isSupplyFormOpen, setIsSupplyFormOpen] = useState(false);

  const room = rooms.find((candidate) => candidate.id === id);
  const roomTasks = tasks.filter((task) => task.roomId === id);
  const roomAppliances = appliances.filter((appliance) => appliance.roomId === id);
  const roomSupplies = supplies.filter(
    (supply) =>
      roomAppliances.some((appliance) => appliance.id === supply.applianceId) ||
      roomTasks.some((task) => task.id === supply.taskId),
  );
  const overdueCount = roomTasks.filter((task) => getTaskStatus(task) === 'overdue').length;
  const dueSoonCount = roomTasks.filter((task) => getTaskStatus(task) === 'due-soon').length;

  if (!room) {
    return (
      <Screen>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>Room not found</Text>
          <Text style={styles.emptyText}>This room may have been removed.</Text>
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add task to ${room.name}`}
          onPress={() => setIsQuickAddOpen(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.addButtonText}>Task</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={styles.roomIcon}>
          <Ionicons name={room.icon as keyof typeof Ionicons.glyphMap} size={26} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Room detail</Text>
          <Text style={styles.title}>{room.name}</Text>
          <Text style={styles.subtitle}>
            {roomTasks.length} tasks · {overdueCount} overdue · {dueSoonCount} due soon
          </Text>
        </View>
      </View>

      <View style={styles.placeholderRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add appliance to ${room.name}`}
          onPress={() => setIsApplianceFormOpen(true)}
          style={styles.placeholderCell}
        >
          <Text style={styles.placeholderLabel}>Appliances</Text>
          <Text style={styles.placeholderValue}>{roomAppliances.length} saved</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add supply to ${room.name}`}
          onPress={() => setIsSupplyFormOpen(true)}
          style={styles.placeholderCell}
        >
          <Text style={styles.placeholderLabel}>Supplies</Text>
          <Text style={styles.placeholderValue}>{roomSupplies.length} linked</Text>
        </Pressable>
      </View>

      <SectionHeader title="Appliances" count={roomAppliances.length} />
      {roomAppliances.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No appliances saved</Text>
          <Text style={styles.emptyText}>Add model numbers and manual links for equipment in this room.</Text>
        </View>
      ) : (
        roomAppliances.map((appliance) => (
          <Pressable
            key={appliance.id}
            accessibilityRole="button"
            onPress={() => router.push(`/appliance/${appliance.id}`)}
            style={styles.assetRow}
          >
            <View style={styles.assetIcon}>
              <Ionicons name="build-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.assetText}>
              <Text style={styles.assetTitle}>{appliance.name}</Text>
              <Text style={styles.assetMeta}>
                {appliance.brand || 'Brand not set'} {appliance.modelNumber ? `· ${appliance.modelNumber}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <SectionHeader title="Supplies" count={roomSupplies.length} />
      {roomSupplies.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No linked supplies</Text>
          <Text style={styles.emptyText}>Save parts, filters, batteries, or bulbs associated with this room.</Text>
        </View>
      ) : (
        roomSupplies.map((supply) => (
          <Pressable
            key={supply.id}
            accessibilityRole="button"
            onPress={() => router.push(`/supply/${supply.id}`)}
            style={styles.assetRow}
          >
            <View style={styles.assetIcon}>
              <Ionicons name="cube-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.assetText}>
              <Text style={styles.assetTitle}>{supply.name}</Text>
              <Text style={styles.assetMeta}>{supply.sizeOrModel || supply.type}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <SectionHeader title="Maintenance tasks" count={roomTasks.length} />
      {roomTasks.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyTitle}>No tasks in this room</Text>
          <Text style={styles.emptyText}>Add a recurring task so this area stays visible on the dashboard.</Text>
        </View>
      ) : (
        roomTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            roomName={room.name}
            onComplete={completeTask}
            onOpen={(taskId) => router.push(`/task/${taskId}`)}
          />
        ))
      )}

      <QuickAddTaskModal
        visible={isQuickAddOpen}
        rooms={rooms}
        appliances={roomAppliances}
        defaultRoomId={room.id}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={addTask}
      />

      <ApplianceFormModal
        visible={isApplianceFormOpen}
        rooms={rooms}
        defaultRoomId={room.id}
        onClose={() => setIsApplianceFormOpen(false)}
        onSubmit={addAppliance}
      />

      <SupplyFormModal
        visible={isSupplyFormOpen}
        appliances={appliances}
        tasks={tasks}
        onClose={() => setIsSupplyFormOpen(false)}
        onSubmit={addSupply}
      />
    </Screen>
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
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  roomIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  headerText: {
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
    fontSize: font.small,
    lineHeight: 19,
  },
  placeholderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  placeholderCell: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  placeholderLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  placeholderValue: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
  },
  assetRow: {
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
  assetIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  assetText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  assetTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  assetMeta: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
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
