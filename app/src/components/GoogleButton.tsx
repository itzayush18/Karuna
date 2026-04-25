import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface GoogleButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function GoogleButton({ 
  title, 
  variant = 'primary', 
  icon, 
  style, 
  textStyle, 
  ...props 
}: GoogleButtonProps) {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return themeColors.primary;
      case 'secondary': return themeColors.backgroundSelected;
      case 'danger': return themeColors.error;
      case 'outline': return 'transparent';
      default: return themeColors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF'; // Always white on primary blue
      case 'danger': return '#FFFFFF';
      case 'secondary': return themeColors.primary;
      case 'outline': return themeColors.primary;
      default: return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: themeColors.border },
        style,
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {icon && (
        <MaterialIcons 
          name={icon} 
          size={20} 
          color={getTextColor()} 
          style={styles.icon} 
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // taller button
    paddingHorizontal: 24,
    borderRadius: 20, // matching the rounded premium style
    marginVertical: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 8,
  },
});
