import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeOpsProvider } from '../src/store/HomeOpsContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HomeOpsProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack screenOptions={{ headerShown: false }} />
      </HomeOpsProvider>
    </SafeAreaProvider>
  );
}
