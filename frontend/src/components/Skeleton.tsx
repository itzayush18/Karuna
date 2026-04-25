import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View style={styles.wrapper}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.row} />
      ))}
    </View>
  );
}

export const Loader = Skeleton;

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  row: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    height: 84,
    opacity: 0.9,
  },
});
