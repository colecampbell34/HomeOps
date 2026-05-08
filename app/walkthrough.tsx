import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { walkthroughTourSteps } from '../src/data/walkthroughTour';
import { useHomeOps } from '../src/store/HomeOpsContext';
import { useWalkthroughTour } from '../src/store/WalkthroughTourContext';
import { colors, font, radii, spacing } from '../src/theme';

export default function WalkthroughScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { completeWalkthrough } = useHomeOps();
  const { startTour } = useWalkthroughTour();
  const isReplay = mode === 'replay';

  function handleStartTour() {
    startTour({ replay: isReplay });
  }

  async function handleSkip() {
    await completeWalkthrough();
    router.replace(isReplay ? '/(tabs)/settings' : '/(tabs)');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>HomeOps</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isReplay ? 'Close walkthrough' : 'Skip walkthrough'}
            onPress={handleSkip}
            style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
          >
            <Text style={styles.skipText}>{isReplay ? 'Close' : 'Skip'}</Text>
          </Pressable>
        </View>

        <View style={styles.introCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="map-outline" size={34} color={colors.primary} />
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>Guided tour</Text>
            <Text style={styles.title}>See where everything lives.</Text>
            <Text style={styles.body}>
              HomeOps will take you through the real app screens and point out how Dashboard, Tasks, Rooms, Assets,
              Seasonal checklists, and Settings fit together.
            </Text>
          </View>

          <View style={styles.routeList}>
            {walkthroughTourSteps.map((step) => (
              <View key={step.id} style={styles.routeRow}>
                <View style={styles.routeIcon}>
                  <Ionicons name={step.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.routeText}>{step.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start guided tour"
            onPress={handleStartTour}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>Start guided tour</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logo: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  skipButton: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
  },
  introCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xl,
    padding: spacing.xl,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  copy: {
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: font.tiny,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  body: {
    color: colors.text,
    fontSize: font.body,
    lineHeight: 22,
  },
  routeList: {
    gap: spacing.sm,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  routeIcon: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.sm,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  routeText: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '800',
  },
  footer: {
    gap: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: font.body,
    fontWeight: '900',
  },
});
