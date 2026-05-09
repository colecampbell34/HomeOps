import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { EmptyState } from '../../src/components/EmptyState';
import { IconButton } from '../../src/components/IconButton';
import { Screen } from '../../src/components/Screen';
import { useHomeOps } from '../../src/store/HomeOpsContext';
import { colors, font, radii, spacing } from '../../src/theme';
import { HomeOpsSnapshot } from '../../src/storage/database';

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
    body: 'HomeOps is local-first today, so the web app can export a JSON backup and restore it into this browser later.',
    points: ['Export includes rooms, tasks, appliances, supplies, completion history, and walkthrough state.', 'Import replaces the current local data in this browser.', 'Cloud backup can still be added later without changing the local data model.'],
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
  const { home, tasks, appliances, supplies, rooms, exportData, importData, resetData } = useHomeOps();
  const [backupStatus, setBackupStatus] = useState<string | undefined>();
  const [isBackupBusy, setIsBackupBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const content = settingsContent[section as SettingsSection];

  async function handleExport() {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      setBackupStatus('Export is available in the web build.');
      return;
    }

    setIsBackupBusy(true);
    setBackupStatus(undefined);

    try {
      const snapshot = await exportData();
      const payload = {
        app: 'HomeOps',
        version: 2,
        exportedAt: new Date().toISOString(),
        snapshot,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `homeops-backup-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setBackupStatus('Backup exported.');
    } catch (error) {
      setBackupStatus(error instanceof Error ? error.message : 'Unable to export backup.');
    } finally {
      setIsBackupBusy(false);
    }
  }

  async function handleImport() {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      setBackupStatus('Import is available in the web build.');
      return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      setIsBackupBusy(true);
      setBackupStatus(undefined);

      try {
        const parsed = JSON.parse(await file.text()) as unknown;
        const snapshot = getSnapshotFromImport(parsed);

        if (!snapshot) {
          throw new Error('That file does not look like a HomeOps backup.');
        }

        await importData(snapshot);
        setBackupStatus('Backup imported.');
      } catch (error) {
        setBackupStatus(error instanceof Error ? error.message : 'Unable to import backup.');
      } finally {
        setIsBackupBusy(false);
      }
    };
    input.click();
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setBackupStatus('Press reset again to replace local data with the starter HomeOps data.');
      return;
    }

    setIsBackupBusy(true);

    try {
      await resetData();
      setBackupStatus('Local data reset.');
      setConfirmReset(false);
    } catch (error) {
      setBackupStatus(error instanceof Error ? error.message : 'Unable to reset local data.');
    } finally {
      setIsBackupBusy(false);
    }
  }

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

      {section === 'export-backup' && (
        <View style={styles.block}>
          <Pressable
            accessibilityRole="button"
            disabled={isBackupBusy}
            onPress={handleExport}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>{isBackupBusy ? 'Working' : 'Export backup'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isBackupBusy}
            onPress={handleImport}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
            <Text style={styles.actionButtonText}>Import backup</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={isBackupBusy}
            onPress={handleReset}
            style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}
          >
            <Ionicons name={confirmReset ? 'alert-circle-outline' : 'refresh-outline'} size={18} color={colors.red} />
            <Text style={styles.dangerButtonText}>{confirmReset ? 'Confirm reset local data' : 'Reset local data'}</Text>
          </Pressable>
          {!!backupStatus && <Text style={styles.statusText}>{backupStatus}</Text>}
        </View>
      )}
    </Screen>
  );
}

function getSnapshotFromImport(parsed: unknown): HomeOpsSnapshot | undefined {
  const maybeRecord = parsed as Partial<HomeOpsSnapshot> & { snapshot?: HomeOpsSnapshot };
  const candidate = maybeRecord.snapshot ?? maybeRecord;

  if (
    candidate &&
    typeof candidate === 'object' &&
    'home' in candidate &&
    Array.isArray(candidate.rooms) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.completions) &&
    Array.isArray(candidate.appliances) &&
    Array.isArray(candidate.supplies)
  ) {
    return candidate as HomeOpsSnapshot;
  }

  return undefined;
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
  actionButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  actionButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  actionButtonText: {
    color: colors.primary,
    fontSize: font.body,
    fontWeight: '800',
  },
  dangerButton: {
    alignItems: 'center',
    borderColor: '#F1C7C0',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  dangerButtonPressed: {
    backgroundColor: colors.redSurface,
  },
  dangerButtonText: {
    color: colors.red,
    fontSize: font.body,
    fontWeight: '800',
  },
  statusText: {
    color: colors.textMuted,
    fontSize: font.small,
    lineHeight: 19,
    textAlign: 'center',
  },
});
