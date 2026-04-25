import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import { Card } from './Card';

export function MetricCard({
  label,
  value,
  tone = 'leaf',
  icon = 'analytics-outline',
}: {
  label: string;
  value: string | number;
  tone?: 'leaf' | 'ocean' | 'danger' | 'warning';
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const color = tone === 'danger' ? colors.error : tone === 'warning' ? colors.warning : tone === 'ocean' ? colors.primary : colors.success;
  return (
    <Card style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} color={color} size={20} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 126,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
  },
});
