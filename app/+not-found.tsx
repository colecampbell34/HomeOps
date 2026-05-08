import { useRouter } from 'expo-router';

import { EmptyState } from '../src/components/EmptyState';
import { IconButton } from '../src/components/IconButton';
import { Screen } from '../src/components/Screen';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen>
      <IconButton icon="chevron-back" label="Go back" onPress={() => router.back()} />
      <EmptyState
        icon="map-outline"
        title="Screen not found"
        body="That HomeOps screen does not exist yet. Return to the previous screen and keep working from there."
      />
    </Screen>
  );
}
