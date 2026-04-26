import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Colors, GoogleColors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';

// Custom FAB Button Component
const CustomTabBarButton = ({ children, onPress }: any) => {
  return (
    <View style={styles.fabWrapper}>
      <TouchableOpacity
        style={styles.fabContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.fab, { backgroundColor: GoogleColors.blue }]}>
          {children}
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Custom Tab Bar using SVG for the curve
const CustomTabBar = (props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;
  const { dark } = useTheme();
  const bgColor = dark ? '#292A2D' : '#FFFFFF';
  const inactiveColor = dark ? '#9AA0A6' : '#5F6368';
  const activeColor = GoogleColors.blue;

  return (
    <View style={styles.tabBarWrapper}>
      {/* Curved Background SVG (Perfect Circular Cutout) */}
      <View style={[styles.svgContainer, { shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10 }]}>
        <Svg width="100%" height={80} viewBox="0 0 375 80" preserveAspectRatio="none">
          <Path
            d="M 0 0 L 137.5 0 Q 147.5 0 147.5 10 A 40 40 0 0 0 227.5 10 Q 227.5 0 237.5 0 L 375 0 L 375 80 L 0 80 Z"
            fill={bgColor}
          />
        </Svg>
      </View>

      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          if (options.tabBarButton && options.tabBarButton({} as any) === null) return null; // Hide explore tab

          const isFocused = state.index === index;
          const isCenter = route.name === 'report';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Render FAB for the Report screen
          if (isCenter) {
            return (
              <CustomTabBarButton key={route.key} onPress={onPress}>
                <MaterialIcons name="add" size={32} color="#FFFFFF" />
              </CustomTabBarButton>
            );
          }

          // Regular Tab Icons
          let iconName: keyof typeof MaterialIcons.glyphMap = 'help';
          if (route.name === 'index') iconName = 'dashboard';
          if (route.name === 'tasks') iconName = 'assignment-turned-in';
          if (route.name === 'profile') iconName = 'person-outline';
          if (route.name === 'impact') iconName = 'insert-chart-outlined';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
              <MaterialIcons
                name={iconName}
                size={28}
                color={isFocused ? activeColor : inactiveColor}
              />
              {/* Optional: Add dot indicator below active tab like the purple app */}
              {isFocused && <View style={[styles.activeDot, { backgroundColor: activeColor }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        {/* Can use ActivityIndicator here */}
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="impact" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    justifyContent: 'flex-end',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    top: -70, // Moved the button even further up
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: GoogleColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
