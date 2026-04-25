import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { MetricCard } from '../components/MetricCard';
import { Screen } from '../components/Screen';
import { StatusPill } from '../components/StatusPill';
import { colors, radius, spacing } from '../constants/theme';
import { useAuthStore } from '../store/auth.store';
import { useOfflineStore } from '../store/offline.store';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queue = useOfflineStore((state) => state.queue);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) ?? 'K'}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{user?.fullName}</Text>
          <View style={styles.badges}>
            <StatusPill label={user?.role ?? 'VOLUNTEER'} tone="good" />
            <StatusPill label={`${queue.length} offline`} tone={queue.length ? 'warn' : 'neutral'} />
          </View>
        </View>
      </Card>
      <View style={styles.metrics}>
        <MetricCard label="Completed" value={12} icon="checkmark-done-outline" />
        <MetricCard label="Helped" value={326} tone="ocean" icon="people-outline" />
        <MetricCard label="Badges" value={4} tone="warning" icon="ribbon-outline" />
      </View>
      <Card>
        <View style={styles.rowTitle}>
          <Ionicons name="time-outline" size={22} color={colors.primary} />
          <Text style={styles.cardTitle}>Timeline</Text>
        </View>
        <Text style={styles.cardText}>Completed food distribution, medical camp support, and water delivery tasks.</Text>
      </Card>
      <Card>
        <View style={styles.rowTitle}>
          <Ionicons name="battery-charging-outline" size={22} color={colors.success} />
          <Text style={styles.cardTitle}>Workload and fatigue</Text>
        </View>
        <Text style={styles.cardText}>Current workload is balanced. Fatigue indicator is low based on recent task volume.</Text>
      </Card>
      <AppButton title="Log out" variant="danger" icon="log-out-outline" onPress={() => void logout()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
    gap: spacing.md,
  },
  name: {
    color: colors.white,
    fontSize: 21,
    fontWeight: '900',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
});
