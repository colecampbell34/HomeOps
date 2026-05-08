import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/components/Screen';
import { colors, font, radii, spacing } from '../../src/theme';

const rows = [
  {
    icon: 'build-outline',
    title: 'Appliances',
    body: 'Furnace, fridge, washer, dryer, water heater, and manuals.',
  },
  {
    icon: 'cube-outline',
    title: 'Supplies',
    body: 'Filter sizes, battery types, bulbs, cleaning supplies, and part models.',
  },
];

export default function AssetsScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Assets</Text>
      <Text style={styles.subtitle}>The shell is ready for appliance and supply records in the next milestone.</Text>

      {rows.map((row) => (
        <View key={row.title} style={styles.row}>
          <View style={styles.icon}>
            <Ionicons name={row.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <Text style={styles.rowBody}>{row.body}</Text>
          </View>
        </View>
      ))}
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
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
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
  },
  rowTitle: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  rowBody: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
  },
});
