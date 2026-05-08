import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

export default function RoomsScreen() {
  const { rooms, tasks } = useHomeOps();

  return (
    <Screen>
      <Text style={styles.title}>Rooms</Text>
      <Text style={styles.subtitle}>Rooms and areas are ready for linking tasks, appliances, and supplies.</Text>

      {rooms.map((room) => {
        const taskCount = tasks.filter((task) => task.roomId === room.id).length;

        return (
          <View key={room.id} style={styles.roomRow}>
            <View style={styles.roomIcon}>
              <Ionicons name={room.icon as keyof typeof Ionicons.glyphMap} size={21} color={colors.primary} />
            </View>
            <View style={styles.roomText}>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.roomMeta}>{taskCount} maintenance tasks</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: font.title,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 21,
    marginBottom: spacing.sm,
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
