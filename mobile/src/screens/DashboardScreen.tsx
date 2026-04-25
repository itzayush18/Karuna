import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { MetricCard } from '../components/MetricCard';
import { Screen } from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { TaskCard } from '../components/TaskCard';
import { colors, radius, spacing } from '../constants/theme';
import { backend } from '../services/backend';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { useAuthStore } from '../store/auth.store';
import { RootStackParamList } from '../navigation/types';

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const summary = useAsyncResource(() => backend.dashboardSummary(), []);
  const tasks = useAsyncResource(() => backend.tasks(), []);

  return (
    <Screen padded={false}>
      <LinearGradient colors={['#4285F4', '#5E97F6']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.eyebrow}>Smart Resource Allocation</Text>
            <Text style={styles.heroTitle}>Relief command center</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="pulse-outline" size={26} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.heroBody}>Welcome back, {user?.fullName ?? 'team member'}. Your highest priority needs are ready below.</Text>
      </LinearGradient>

      <View style={styles.content}>
        {summary.loading ? (
          <Skeleton rows={2} />
        ) : (
          <View style={styles.metrics}>
            <MetricCard label="Urgent" value={summary.data?.openUrgentTasks ?? 0} tone="danger" icon="alert-circle-outline" />
            <MetricCard label="Volunteers" value={24} tone="leaf" icon="people-outline" />
            <MetricCard label="Avg score" value={summary.data?.averageUrgency ?? 0} tone="ocean" icon="speedometer-outline" />
          </View>
        )}

        <Card style={styles.syncCard}>
          <View style={styles.syncIcon}>
            <Ionicons name="cloud-done-outline" size={24} color={colors.success} />
          </View>
          <View style={styles.syncCopy}>
            <Text style={styles.cardTitle}>Operational filters</Text>
            <Text style={styles.cardText}>Location, category, and urgency filters are API-ready for backend query params.</Text>
          </View>
          <AppButton title="Review" variant="secondary" style={styles.smallButton} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most urgent</Text>
          <Text style={styles.sectionHint}>{tasks.data?.length ?? 0} open items</Text>
        </View>
        {tasks.loading ? (
          <Skeleton />
        ) : (
          tasks.data?.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} onPress={() => navigation.navigate('TaskDetail', { task })} />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: spacing.lg,
    paddingBottom: 64,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroBody: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    gap: spacing.lg,
    marginTop: -40,
    padding: spacing.lg,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  syncCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  syncIcon: {
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  syncCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  smallButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
});
