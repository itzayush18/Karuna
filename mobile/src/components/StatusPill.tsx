import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'good' | 'warn' | 'danger' }) {
  const styles = {
    neutral: ['#F1F3F4', colors.muted],
    good: ['#E6F4EA', '#188038'],
    warn: ['#FEF7E0', '#B06000'],
    danger: ['#FCE8E6', '#C5221F'],
  }[tone];
  return (
    <View style={[pillStyles.pill, { backgroundColor: styles[0] }]}>
      <Text style={[pillStyles.label, { color: styles[1] }]}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
