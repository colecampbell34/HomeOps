import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ApplianceFormModal } from '../../src/components/ApplianceFormModal';
import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { SupplyFormModal } from '../../src/components/SupplyFormModal';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

type AssetMode = 'appliances' | 'supplies' | 'low-stock';

export default function AssetsScreen() {
  const router = useRouter();
  const {
    addAppliance,
    addSupply,
    appliances,
    getApplianceName,
    getRoomName,
    getTaskTitle,
    lowStockSupplies,
    rooms,
    supplies,
    tasks,
  } = useHomeOps();
  const [mode, setMode] = useState<AssetMode>('appliances');
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [isSupplyFormOpen, setIsSupplyFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const subtitle = useMemo(() => {
    if (mode === 'appliances') {
      return `${appliances.length} appliance records with model and manual details.`;
    }

    if (mode === 'low-stock') {
      return `${lowStockSupplies.length} supplies are at or below their stock threshold.`;
    }

    return `${supplies.length} supply records for filters, batteries, parts, and consumables.`;
  }, [appliances.length, lowStockSupplies.length, mode, supplies.length]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredAppliances = useMemo(() => {
    if (!normalizedSearch) {
      return appliances;
    }

    return appliances.filter((appliance) =>
      [appliance.name, appliance.brand, appliance.modelNumber, appliance.serialNumber, getRoomName(appliance.roomId)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [appliances, getRoomName, normalizedSearch]);

  const filteredSupplies = useMemo(() => {
    const baseSupplies = mode === 'low-stock' ? lowStockSupplies : supplies;

    if (!normalizedSearch) {
      return baseSupplies;
    }

    return baseSupplies.filter((supply) =>
      [
        supply.name,
        supply.type,
        supply.sizeOrModel,
        supply.brand,
        supply.lastPurchasedVendor,
        getRoomName(supply.roomId),
        getApplianceName(supply.applianceId),
        getTaskTitle(supply.taskId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [getApplianceName, getRoomName, getTaskTitle, lowStockSupplies, mode, normalizedSearch, supplies]);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Assets</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'appliances' ? 'Add appliance' : 'Add supply'}
          onPress={() => (mode === 'appliances' ? setIsApplianceFormOpen(true) : setIsSupplyFormOpen(true))}
          style={styles.addButton}
        >
          <Ionicons name="add" size={17} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.segmented}>
        <SegmentButton label="Appliances" selected={mode === 'appliances'} onPress={() => setMode('appliances')} />
        <SegmentButton label="Supplies" selected={mode === 'supplies'} onPress={() => setMode('supplies')} />
        <SegmentButton label="Low stock" selected={mode === 'low-stock'} onPress={() => setMode('low-stock')} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color={colors.textMuted} />
        <TextInput
          accessibilityLabel={`Search ${mode}`}
          onChangeText={setSearchQuery}
          placeholder={mode === 'appliances' ? 'Search appliances, models, rooms' : 'Search supplies, sizes, parts'}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
        />
        {!!searchQuery && (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {mode === 'appliances' ? (
        filteredAppliances.length === 0 ? (
          <EmptyState
            icon="build-outline"
            title={appliances.length === 0 ? 'No appliances yet' : 'No appliances found'}
            body={
              appliances.length === 0
                ? 'Add equipment like a fridge, furnace, washer, dryer, water heater, or sump pump so model numbers are easy to find.'
                : 'Try a different appliance, brand, model, or room search.'
            }
            actionLabel={appliances.length === 0 ? 'Add appliance' : undefined}
            onAction={appliances.length === 0 ? () => setIsApplianceFormOpen(true) : undefined}
          />
        ) : (
          filteredAppliances.map((appliance) => (
            <Pressable
              key={appliance.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${appliance.name}`}
              onPress={() => router.push(`/appliance/${appliance.id}`)}
              style={({ pressed }) => [styles.assetRow, pressed && styles.assetRowPressed]}
            >
              <View style={styles.icon}>
                <Ionicons name="build-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{appliance.name}</Text>
                <Text style={styles.rowMeta}>
                  {getRoomName(appliance.roomId)} · {appliance.brand || 'Brand not set'}
                  {appliance.modelNumber ? ` · ${appliance.modelNumber}` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )
      ) : filteredSupplies.length === 0 ? (
        <EmptyState
          icon={mode === 'low-stock' ? 'alert-circle-outline' : 'cube-outline'}
          title={supplies.length === 0 ? 'No supplies yet' : mode === 'low-stock' ? 'No low-stock supplies' : 'No supplies found'}
          body={
            supplies.length === 0
              ? 'Save filter sizes, batteries, bulbs, cleaning supplies, and replacement parts you buy repeatedly.'
              : mode === 'low-stock'
                ? 'Set quantity and low-stock thresholds on supplies to track what needs to be reordered.'
                : 'Try a different supply, size, model, brand, appliance, or task search.'
          }
          actionLabel={supplies.length === 0 ? 'Add supply' : undefined}
          onAction={supplies.length === 0 ? () => setIsSupplyFormOpen(true) : undefined}
        />
      ) : (
        filteredSupplies.map((supply) => (
          <Pressable
            key={supply.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${supply.name}`}
            onPress={() => router.push(`/supply/${supply.id}`)}
            style={({ pressed }) => [styles.assetRow, pressed && styles.assetRowPressed]}
          >
            <View style={styles.icon}>
              <Ionicons
                name={isLowStock(supply) ? 'alert-circle-outline' : 'cube-outline'}
                size={20}
                color={isLowStock(supply) ? colors.amber : colors.primary}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{supply.name}</Text>
              <Text style={styles.rowMeta}>
                {supply.sizeOrModel || supply.type} · {getRoomName(supply.roomId)}
              </Text>
              <Text style={styles.rowMeta}>
                Qty {formatQuantity(supply.quantityOnHand)}
                {typeof supply.lowStockThreshold === 'number' ? ` · Low at ${supply.lowStockThreshold}` : ''}
                {supply.applianceId ? ` · ${getApplianceName(supply.applianceId)}` : ''}
              </Text>
              {!!supply.taskId && <Text style={styles.rowMeta}>Task: {getTaskTitle(supply.taskId)}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <ApplianceFormModal
        visible={isApplianceFormOpen}
        rooms={rooms}
        onClose={() => setIsApplianceFormOpen(false)}
        onSubmit={addAppliance}
      />

      <SupplyFormModal
        visible={isSupplyFormOpen}
        appliances={appliances}
        rooms={rooms}
        tasks={tasks}
        onClose={() => setIsSupplyFormOpen(false)}
        onSubmit={addSupply}
      />
    </Screen>
  );
}

function isLowStock(supply: { quantityOnHand?: number; lowStockThreshold?: number }) {
  return (
    typeof supply.quantityOnHand === 'number' &&
    typeof supply.lowStockThreshold === 'number' &&
    supply.quantityOnHand <= supply.lowStockThreshold
  );
}

function formatQuantity(value?: number): string {
  return typeof value === 'number' ? String(value) : 'not set';
}

function SegmentButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.segment, selected && styles.segmentSelected]}>
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
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
  segmented: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: 3,
    padding: 3,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: font.body,
    minWidth: 0,
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
    fontSize: font.small,
    fontWeight: '800',
  },
  segmentTextSelected: {
    color: colors.primary,
  },
  assetRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.lg,
  },
  assetRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
});
