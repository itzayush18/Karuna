import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false, ...props }: CardProps) {
  const { colors, dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          borderWidth: dark ? 1 : 1, // subtle border in both
          shadowColor: dark ? '#000' : themeColors.text,
          shadowOpacity: elevated ? (dark ? 0.3 : 0.08) : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32, // Maximum smoothness for Bento grid vibe
    padding: 24,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 8 }, 
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
});
