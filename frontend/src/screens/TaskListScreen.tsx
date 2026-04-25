import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { StatusPill } from '../components/StatusPill';
import { TaskCard } from '../components/TaskCard';
import { colors, spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { backend } from '../services/backend';
import { useAsyncResource } from '../hooks/useAsyncResource';

export function TaskListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasks = useAsyncResource(() => backend.tasks(), []);
  const sorted = [...(tasks.data ?? [])].sort((a, b) => (b.urgencyScores?.[0]?.score ?? 0) - (a.urgencyScores?.[0]?.score ?? 0));

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tasks and needs</Text>
          <Text style={styles.subtitle}>Sorted by urgency with assignment details.</Text>
        </View>
        <StatusPill label={`${sorted.length} total`} />
      </View>
      <View style={styles.filters}>
        <StatusPill label="urgent" tone="danger" />
        <StatusPill label="medium" tone="warn" />
        <StatusPill label="resolved" tone="good" />
      </View>
      {tasks.loading ? <Skeleton rows={5} /> : null}
      {!tasks.loading && !sorted.length ? <EmptyState title="No tasks yet" body="New urgent needs will appear here after reports are processed." icon="checkbox-outline" /> : null}
      <View style={styles.list}>
        {sorted.map((task) => (
          <TaskCard key={task.id} task={task} onPress={() => navigation.navigate('TaskDetail', { task })} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
});
