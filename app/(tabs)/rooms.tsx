import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EmptyState } from '../../src/components/EmptyState';
import { RoomFormModal } from '../../src/components/RoomFormModal';
import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

export default function RoomsScreen() {
  const router = useRouter();
  const { addRoom, rooms, tasks } = useHomeOps();
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.subtitle}>Create areas and link tasks, appliances, and supplies by location.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add room"
          onPress={() => setIsRoomFormOpen(true)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {rooms.length === 0 ? (
        <EmptyState
          icon="grid-outline"
          title="No rooms yet"
          body="Add rooms or areas like Kitchen, Garage, Basement, Exterior, or HVAC / Utility so tasks and supplies are easier to find."
          actionLabel="Add room"
          onAction={() => setIsRoomFormOpen(true)}
        />
      ) : (
        rooms.map((room) => {
          const taskCount = tasks.filter((task) => task.roomId === room.id).length;

          return (
            <Pressable
              key={room.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${room.name}`}
              onPress={() => router.push(`/room/${room.id}`)}
              style={({ pressed }) => [styles.roomRow, pressed && styles.roomRowPressed]}
            >
              <View style={styles.roomIcon}>
                <Ionicons name={room.icon as keyof typeof Ionicons.glyphMap} size={21} color={colors.primary} />
              </View>
              <View style={styles.roomText}>
                <Text style={styles.roomTitle}>{room.name}</Text>
                <Text style={styles.roomMeta}>{taskCount} maintenance tasks</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          );
        })
      )}

      <RoomFormModal visible={isRoomFormOpen} onClose={() => setIsRoomFormOpen(false)} onSubmit={addRoom} />
    </Screen>
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
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  addButtonText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '800',
  },
  roomRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 72,
    padding: spacing.lg,
  },
  roomRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  roomIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  roomText: {
    flex: 1,
    gap: spacing.xs,
  },
  roomTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  roomMeta: {
    color: colors.textMuted,
    fontSize: font.small,
  },
});
