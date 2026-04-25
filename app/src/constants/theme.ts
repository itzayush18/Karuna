/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const GoogleColors = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC05',
  green: '#34A853',
};

export const Colors = {
  light: {
    text: '#202124',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: GoogleColors.blue,
    success: GoogleColors.green,
    warning: GoogleColors.yellow,
    error: GoogleColors.red,
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E8F0FE', // Light blue tint
    textSecondary: '#5F6368',
    border: '#DADCE0',
  },
  dark: {
    text: '#E8EAED',
    background: '#202124',
    surface: '#292A2D',
    primary: '#8AB4F8', // Lighter blue for dark mode
    success: '#81C995', // Lighter green
    warning: '#FDE293', // Lighter yellow
    error: '#F28B82', // Lighter red
    backgroundElement: '#3C4043',
    backgroundSelected: '#303134',
    textSecondary: '#9AA0A6',
    border: '#5F6368',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
