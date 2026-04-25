import React from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleColors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';

interface CurvedHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function CurvedHeader({ title, subtitle, color = GoogleColors.blue, icon }: CurvedHeaderProps) {
  const { dark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {icon && <MaterialIcons name={icon} size={48} color="#FFFFFF" style={styles.icon} />}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </SafeAreaView>
      <View style={styles.curveContainer}>
        <Svg width="100%" height="50" viewBox="0 0 375 50" preserveAspectRatio="none">
          <Path
            d="M0,0 L375,0 L375,10 C187.5,60 0,10 0,10 Z"
            fill={color}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20, // space for the curve
    position: 'relative',
    zIndex: 100,
    elevation: 100,
  },
  safeArea: {
    paddingTop: 40, // Ensure content is below status bar
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  curveContainer: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 50,
  },
});
