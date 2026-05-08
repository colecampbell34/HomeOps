import { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { WalkthroughCoach } from '../src/components/WalkthroughCoach';
import { HomeOpsProvider, useHomeOps } from '../src/store/HomeOpsContext';
import { WalkthroughTourProvider, useWalkthroughTour } from '../src/store/WalkthroughTourContext';
import { colors } from '../src/theme';

function WalkthroughGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasCompletedWalkthrough, isReady } = useHomeOps();
  const { isTourActive } = useWalkthroughTour();

  useEffect(() => {
    if (!isReady || hasCompletedWalkthrough || isTourActive || pathname === '/walkthrough') {
      return;
    }

    router.replace('/walkthrough');
  }, [hasCompletedWalkthrough, isReady, isTourActive, pathname, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HomeOpsProvider>
        <WalkthroughTourProvider>
          <StatusBar style="dark" backgroundColor={colors.background} />
          <WalkthroughGate />
          <Stack screenOptions={{ headerShown: false }} />
          <WalkthroughCoach />
          <Analytics />
          <SpeedInsights />
        </WalkthroughTourProvider>
      </HomeOpsProvider>
    </SafeAreaProvider>
  );
}
