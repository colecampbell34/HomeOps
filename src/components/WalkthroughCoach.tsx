import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHomeOps } from '../store/HomeOpsContext';
import { useWalkthroughTour } from '../store/WalkthroughTourContext';
import { colors, font, radii, spacing } from '../theme';

export function WalkthroughCoach() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeWalkthrough } = useHomeOps();
  const {
    currentIndex,
    currentStep,
    endTour,
    isReplay,
    isTourActive,
    nextStep,
    previousStep,
    totalSteps,
  } = useWalkthroughTour();

  const isLastStep = currentIndex === totalSteps - 1;
  const coachBottom = Math.max(92, insets.bottom + 72);

  useEffect(() => {
    if (!isTourActive) {
      return;
    }

    router.replace(currentStep.route);
  }, [currentStep.route, isTourActive, router]);

  if (!isTourActive) {
    return null;
  }

  async function finishTour() {
    await completeWalkthrough();
    endTour();
    router.replace(isReplay ? '/(tabs)/settings' : '/(tabs)');
  }

  async function skipTour() {
    await completeWalkthrough();
    endTour();
    router.replace(isReplay ? '/(tabs)/settings' : '/(tabs)');
  }

  function handleNext() {
    if (isLastStep) {
      finishTour();
      return;
    }

    nextStep();
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.scrim, { bottom: coachBottom + 210 }]} />
      <View style={[styles.card, { bottom: coachBottom }]}>
        <View style={styles.headerRow}>
          <View style={styles.stepBadge}>
            <Ionicons name={currentStep.icon} size={18} color={colors.primary} />
            <Text style={styles.stepLabel}>{currentStep.label}</Text>
          </View>
          <Text style={styles.stepCount}>
            {currentIndex + 1}/{totalSteps}
          </Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.body}>{currentStep.body}</Text>
          <View style={styles.focusBox}>
            <Text style={styles.focusLabel}>Look for</Text>
            <Text style={styles.focusText}>{currentStep.focus}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip guided tour"
            onPress={skipTour}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
          >
            <Text style={styles.secondaryText}>Skip</Text>
          </Pressable>

          <View style={styles.rightActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous tour step"
              disabled={currentIndex === 0}
              onPress={previousStep}
              style={({ pressed }) => [
                styles.iconButton,
                currentIndex === 0 && styles.disabledButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={currentIndex === 0 ? colors.textMuted : colors.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isLastStep ? 'Finish guided tour' : 'Next tour step'}
              onPress={handleNext}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            >
              <Text style={styles.primaryText}>{isLastStep ? 'Finish' : 'Next'}</Text>
              {!isLastStep && <Ionicons name="arrow-forward" size={18} color={colors.white} />}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: 'rgba(31, 42, 39, 0.08)',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    left: spacing.md,
    padding: spacing.lg,
    position: 'absolute',
    right: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: colors.greenSurface,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepLabel: {
    color: colors.primary,
    fontSize: font.small,
    fontWeight: '900',
  },
  stepCount: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '800',
  },
  copy: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: font.section,
    fontWeight: '900',
    lineHeight: 23,
  },
  body: {
    color: colors.text,
    fontSize: font.small,
    lineHeight: 19,
  },
  focusBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    gap: spacing.xs,
    padding: spacing.md,
  },
  focusLabel: {
    color: colors.textMuted,
    fontSize: font.tiny,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  focusText: {
    color: colors.text,
    fontSize: font.small,
    lineHeight: 18,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryText: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '900',
  },
  iconButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 92,
    paddingHorizontal: spacing.md,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryText: {
    color: colors.white,
    fontSize: font.small,
    fontWeight: '900',
  },
});
