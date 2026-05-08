import { StyleSheet, Text, View } from 'react-native';

import { colors, font, spacing } from '../theme';

type SectionHeaderProps = {
  title: string;
  count?: number;
};

export function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {count !== undefined && <Text style={styles.count}>{count}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: font.section,
    fontWeight: '800',
  },
  count: {
    color: colors.textMuted,
    fontSize: font.small,
    fontWeight: '700',
  },
});
