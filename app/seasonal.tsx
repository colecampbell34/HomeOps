import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { seasonalChecklistItems, seasonLabels } from '../src/data/seasonal';
import { Screen } from '../src/components/Screen';
import { useHomeOps } from '../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../src/theme';
import { Season, SeasonalChecklistItem } from '../src/types';
import { addRecurrence, recurrenceLabel, toISODate, today } from '../src/utils/dates';

const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];

export default function SeasonalScreen() {
  const router = useRouter();
  const { addTask, rooms, tasks } = useHomeOps();
  const [selectedSeason, setSelectedSeason] = useState<Season>(getCurrentSeason());
  const [addingId, setAddingId] = useState<string | undefined>();

  const visibleItems = useMemo(
    () => seasonalChecklistItems.filter((item) => item.season === selectedSeason),
    [selectedSeason],
  );

  async function handleAddItem(item: SeasonalChecklistItem) {
    if (addingId) {
      return;
    }

    setAddingId(item.id);

    try {
      const matchingRoom = item.roomType ? rooms.find((room) => room.type === item.roomType) : undefined;

      await addTask({
        title: item.title,
        roomId: matchingRoom?.id,
        category: item.category,
        notes: item.description,
        priority: item.priority,
        recurrenceType: item.suggestedRecurrence,
        recurrenceInterval: item.suggestedInterval,
        nextDueAt: toISODate(today()),
      });
    } finally {
      setAddingId(undefined);
    }
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Seasonal checklist</Text>
        <Text style={styles.title}>Add recommended home care tasks</Text>
        <Text style={styles.subtitle}>
          Starter checklists stay practical: add only the tasks you want to track as recurring maintenance.
        </Text>
      </View>

      <View style={styles.seasonGrid}>
        {seasons.map((season) => (
          <Pressable
            key={season}
            accessibilityRole="button"
            onPress={() => setSelectedSeason(season)}
            style={[styles.seasonButton, selectedSeason === season && styles.seasonButtonActive]}
          >
            <Text style={[styles.seasonText, selectedSeason === season && styles.seasonTextActive]}>{seasonLabels[season]}</Text>
          </Pressable>
        ))}
      </View>

      {visibleItems.map((item) => {
        const alreadyAdded = tasks.some((task) => task.title.trim().toLowerCase() === item.title.trim().toLowerCase());
        const matchingRoom = item.roomType ? rooms.find((room) => room.type === item.roomType) : undefined;

        return (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemIcon}>
                <Ionicons name={iconForCategory(item.category)} size={20} color={colors.primary} />
              </View>
              <View style={styles.itemTitleGroup}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {item.category} · {recurrenceLabel(item.suggestedRecurrence, item.suggestedInterval)}
                  {matchingRoom ? ` · ${matchingRoom.name}` : ''}
                </Text>
              </View>
            </View>

            {!!item.description && <Text style={styles.itemDescription}>{item.description}</Text>}

            <Pressable
              accessibilityRole="button"
              disabled={alreadyAdded || addingId === item.id}
              onPress={() => handleAddItem(item)}
              style={({ pressed }) => [
                styles.addButton,
                (pressed || alreadyAdded || addingId === item.id) && styles.addButtonMuted,
              ]}
            >
              <Ionicons name={alreadyAdded ? 'checkmark' : 'add'} size={17} color={colors.white} />
              <Text style={styles.addButtonText}>
                {alreadyAdded ? 'Already in tasks' : addingId === item.id ? 'Adding' : 'Add to tasks'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </Screen>
  );
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) {
    return 'spring';
  }

  if (month >= 5 && month <= 7) {
    return 'summer';
  }

  if (month >= 8 && month <= 10) {
    return 'fall';
  }

  return 'winter';
}

function iconForCategory(category: string): keyof typeof Ionicons.glyphMap {
  const normalized = category.toLowerCase();

  if (normalized.includes('safety')) {
    return 'shield-checkmark-outline';
  }

  if (normalized.includes('hvac') || normalized.includes('utility')) {
    return 'thermometer-outline';
  }

  if (normalized.includes('kitchen')) {
    return 'restaurant-outline';
  }

  if (normalized.includes('laundry')) {
    return 'shirt-outline';
  }

  return 'home-outline';
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
  header: {
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
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 21,
  },
  seasonGrid: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 3,
    padding: 3,
  },
  seasonButton: {
    alignItems: 'center',
    borderRadius: radii.sm,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  seasonButtonActive: {
    backgroundColor: colors.surface,
  },
  seasonText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
  },
  seasonTextActive: {
    color: colors.primary,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  itemTitleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
    lineHeight: 20,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
  itemDescription: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 20,
  },
  addButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 38,
    paddingHorizontal: spacing.md,
  },
  addButtonMuted: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '800',
  },
});
