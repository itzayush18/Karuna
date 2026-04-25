import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { StatusPill } from '../components/StatusPill';
import { colors, radius, spacing } from '../constants/theme';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { backend } from '../services/backend';

export function NotificationsScreen() {
  const notifications = useAsyncResource(() => backend.notifications(), []);
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Assignments, urgent alerts, and system updates.</Text>
      </View>
      {notifications.loading ? <Skeleton /> : null}
      {!notifications.loading && !notifications.data?.length ? <EmptyState title="No notifications" body="You are all caught up." icon="notifications-outline" /> : null}
      <View style={styles.list}>
        {notifications.data?.map((item) => (
          <Card key={item.id}>
            <View style={styles.cardHeader}>
              <View style={styles.icon}>
                <Ionicons name={item.type === 'URGENT_NEED' ? 'alert-circle-outline' : 'notifications-outline'} size={22} color={item.type === 'URGENT_NEED' ? colors.error : colors.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              <StatusPill label={item.type.replace('_', ' ')} tone={item.type === 'URGENT_NEED' ? 'danger' : 'neutral'} />
            </View>
          </Card>
        ))}
      </View>
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
  list: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  copy: {
    flex: 1,
    gap: 5,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
