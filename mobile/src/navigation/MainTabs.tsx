import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/theme';
import { useAuthStore } from '../store/auth.store';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MapScreen } from '../screens/MapScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportSubmitScreen } from '../screens/ReportSubmitScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Map: 'map-outline',
  Reports: 'document-text-outline',
  Tasks: 'checkbox-outline',
  Notifications: 'notifications-outline',
  Profile: 'person-outline',
};

export function MainTabs() {
  const role = useAuthStore((state) => state.user?.role);
  const canSubmitReports = role === 'FIELD_WORKER' || role === 'COORDINATOR' || role === 'ADMIN';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.divider, height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      {canSubmitReports ? <Tab.Screen name="Reports" component={ReportSubmitScreen} /> : null}
      <Tab.Screen name="Tasks" component={TaskListScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
