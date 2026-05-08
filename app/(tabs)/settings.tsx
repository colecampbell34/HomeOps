import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

type SettingItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  route?: string;
};

const settings: SettingItem[] = [
  {
    id: 'home-profile',
    icon: 'home-outline',
    title: 'Home profile',
    body: 'Name, address placeholder, and local home setup.',
  },
  {
    id: 'reminders',
    icon: 'notifications-outline',
    title: 'Reminder preferences',
    body: 'Basic local reminder settings before push notifications.',
  },
  {
    id: 'export-backup',
    icon: 'download-outline',
    title: 'Export and backup',
    body: 'Placeholder for future export, backup, and cloud sync.',
  },
  {
    id: 'premium',
    icon: 'star-outline',
    title: 'Premium',
    body: 'Freemium limits and subscription placeholder.',
  },
  {
    id: 'launch-readiness',
    icon: 'rocket-outline',
    title: 'Launch readiness',
    body: 'Pre-publish checklist, onboarding, and App Store prep.',
  },
  {
    id: 'walkthrough',
    icon: 'map-outline',
    title: 'Walkthrough',
    body: 'Replay the short guide to the main HomeOps sections.',
    route: '/walkthrough?mode=replay',
  },
  {
    id: 'about',
    icon: 'information-circle-outline',
    title: 'About',
    body: 'Product purpose, version, and contact placeholder.',
  },
  {
    id: 'privacy',
    icon: 'lock-closed-outline',
    title: 'Privacy',
    body: 'Local-first privacy notes and policy placeholder.',
  },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { home } = useHomeOps();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>{home.name}</Text>
      </View>

      <View style={styles.list}>
        {settings.map((setting) => (
          <Pressable
            key={setting.id}
            accessibilityRole="button"
            accessibilityLabel={setting.title}
            onPress={() => router.push(setting.route ?? `/settings/${setting.id}`)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.icon}>
              <Ionicons name={setting.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowText}>{setting.title}</Text>
              <Text style={styles.rowBody}>{setting.body}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
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
  list: {
    gap: spacing.md,
  },
  row: {
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
  rowPressed: {
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
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  rowText: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
  rowBody: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 18,
  },
});
