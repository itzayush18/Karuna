import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../constants/theme';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ title, onPress, loading, disabled, variant = 'primary', icon, style }: Props) {
  const palette = {
    primary: { backgroundColor: colors.primary, color: colors.white, borderColor: colors.primary },
    secondary: { backgroundColor: colors.surface, color: colors.primary, borderColor: colors.border },
    danger: { backgroundColor: colors.error, color: colors.white, borderColor: colors.error },
    ghost: { backgroundColor: 'transparent', color: colors.text, borderColor: colors.border },
  }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? shadows.button : null,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor, opacity: isDisabled ? 0.55 : pressed ? 0.86 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.color} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={palette.color} /> : null}
          <Text style={[styles.label, { color: palette.color }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
