import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface UrgencyBadgeProps {
  score?: number;
  level?: 'high' | 'medium' | 'low';
}

export function UrgencyBadge({ score, level }: UrgencyBadgeProps) {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  // Determine urgency level from score if provided
  let calculatedLevel = level;
  if (score !== undefined) {
    if (score >= 70) calculatedLevel = 'high';
    else if (score >= 40) calculatedLevel = 'medium';
    else calculatedLevel = 'low';
  }

  const getConfig = () => {
    switch (calculatedLevel) {
      case 'high':
        return {
          color: themeColors.error,
          text: 'Urgent',
          icon: 'error-outline' as const,
        };
      case 'medium':
        return {
          color: themeColors.warning,
          text: 'Medium',
          icon: 'warning-amber' as const,
        };
      case 'low':
      default:
        return {
          color: themeColors.success,
          text: 'Low',
          icon: 'check-circle-outline' as const,
        };
    }
  };

  const config = getConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
      <MaterialIcons name={config.icon} size={14} color={config.color} style={styles.icon} />
      <Text style={[styles.text, { color: config.color }]}>
        {score !== undefined ? `${score} - ` : ''}{config.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 4,
  },
});
