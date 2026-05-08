import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '../../src/components/EmptyState';
import { IconButton } from '../../src/components/IconButton';
import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';

const settingsContent = {
  'home-profile': {
    icon: 'home-outline',
    title: 'Home profile',
    body: 'HomeOps is currently set up for one local home. Multiple homes and cloud account support are intentionally later-stage features.',
    points: ['Home name is stored locally.', 'Address is optional and not required for MVP use.', 'Rooms, tasks, appliances, and supplies belong to this home.'],
  },
  reminders: {
    icon: 'notifications-outline',
    title: 'Reminder preferences',
    body: 'Recurring task dates are stored now. Push notifications will be added after the local task model is stable.',
    points: ['Current reminders are represented by next due dates.', 'Supported schedules include weekly, monthly, 3 months, 6 months, yearly, and custom.', 'Local notifications are planned before cloud sync.'],
  },
  'export-backup': {
    icon: 'download-outline',
    title: 'Export and backup',
    body: 'Export and backup are placeholders for a later milestone. The app is local-first today.',
    points: ['SQLite stores MVP data on device.', 'Future exports may include maintenance history and home summaries.', 'Future backup can be added without changing the core data model.'],
  },
  premium: {
    icon: 'star-outline',
    title: 'Premium',
    body: 'Payments are not implemented yet. This screen keeps the app ready for freemium limits later without blocking MVP usability.',
    points: ['Free tier target: one home and limited maintenance items.', 'Paid tier target: unlimited items, appliances, photos/documents, and history.', 'RevenueCat or another subscription layer can be added later.'],
  },
  'launch-readiness': {
    icon: 'rocket-outline',
    title: 'Launch readiness',
    body: 'HomeOps is not ready for App Store submission yet. This page tracks release work that should happen after the MVP is stable.',
    points: ['Add a short first-run walkthrough before public launch.', 'Finalize app icon, screenshots, privacy policy, support URL, and listing copy.', 'Decide whether TestFlight includes analytics, crash reporting, or any paywall scaffolding.'],
  },
  about: {
    icon: 'information-circle-outline',
    title: 'About HomeOps',
    body: 'HomeOps helps households know what needs attention, when to do it, and what parts or details they need.',
    points: ['Version 1.0.0 MVP shell.', 'Focused on practical upkeep, not legal proof or insurance claims.', 'Built local-first with Expo and SQLite.'],
  },
  privacy: {
    icon: 'lock-closed-outline',
    title: 'Privacy',
    body: 'HomeOps currently stores MVP data locally on this device. No cloud sync, account system, analytics, or payments are active.',
    points: ['Home, task, appliance, and supply records stay in local SQLite.', 'Photos/documents are not implemented yet.', 'A full privacy policy is required before App Store submission.'],
  },
} as const;

type SettingsSection = keyof typeof settingsContent;

export default function SettingsDetailScreen() {
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const { home, tasks, appliances, supplies, rooms } = useHomeOps();
  const content = settingsContent[section as SettingsSection];

  if (!content) {
    return (
      <Screen>
        <IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />
        <EmptyState title="Setting not found" body="This settings page is not available." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name={content.icon} size={26} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Settings</Text>
          <Text style={styles.title}>{content.title}</Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockText}>{content.body}</Text>
      </View>

      <View style={styles.block}>
        {content.points.map((point) => (
          <View key={point} style={styles.pointRow}>
            <Ionicons name="checkmark" size={16} color={colors.primary} />
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>

      {section === 'home-profile' && (
        <View style={styles.statsGrid}>
          <Stat label="Home" value={home.name} />
          <Stat label="Rooms" value={String(rooms.length)} />
          <Stat label="Tasks" value={String(tasks.length)} />
          <Stat label="Assets" value={String(appliances.length + supplies.length)} />
        </View>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  headerCopy: {
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
    lineHeight: 34,
  },
  block: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  blockText: {
    color: colors.textMuted,
    fontSize: font.body,
    lineHeight: 22,
  },
  pointRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pointText: {
    color: colors.text,
    flex: 1,
    fontSize: font.small,
    lineHeight: 19,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexBasis: '45%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '800',
  },
});
