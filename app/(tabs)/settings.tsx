import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

const settings = [
  'Home profile',
  'Reminder preferences',
  'Export and backup',
  'Premium placeholder',
  'About and privacy',
];

export default function SettingsScreen() {
  const { home } = useHomeOps();

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>{home.name}</Text>

      <View style={styles.list}>
        {settings.map((setting) => (
          <View key={setting} style={styles.row}>
            <Text style={styles.rowText}>{setting}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        ))}
      </View>
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
    marginBottom: spacing.sm,
  },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
  },
  rowText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
  },
});
