import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, font, radii, spacing } from '../theme';

type ErrorBannerProps = {
  title?: string;
  message: string;
};

export function ErrorBanner({ title = 'Something needs attention', message }: ErrorBannerProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={20} color={colors.red} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: colors.redSurface,
    borderColor: '#F1C7C0',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.red,
    fontSize: font.body,
    fontWeight: '800',
  },
  message: {
    color: colors.red,
    fontSize: font.small,
    lineHeight: 19,
  },
});
