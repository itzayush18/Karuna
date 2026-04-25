import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { StatusPill } from '../components/StatusPill';
import { colors, radius, spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export function TaskDetailScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'TaskDetail'>) {
  const { task } = route.params;
  const score = task.urgencyScores?.[0]?.score ?? 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.subtitle}>{task.location?.village}, {task.location?.district}</Text>
      </View>
      <Card style={styles.summary}>
        <View style={styles.badges}>
          <StatusPill label={task.category} />
          <StatusPill label={`${score}/100 urgency`} tone={score >= 70 ? 'danger' : score >= 50 ? 'warn' : 'good'} />
          <StatusPill label={task.status} />
        </View>
        <Text style={styles.description}>{task.description}</Text>
        <View style={styles.peopleRow}>
          <Ionicons name="people-outline" size={18} color={colors.primary} />
          <Text style={styles.people}>{task.affectedPeople} people affected</Text>
        </View>
      </Card>
      <Card>
        <View style={styles.matchTitle}>
          <View style={styles.matchIcon}>
            <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Volunteer match explanation</Text>
        </View>
        <Text style={styles.cardText}>Assigned because you are nearby, have relevant skills, and your current workload is low.</Text>
      </Card>
      <View style={styles.actions}>
        <AppButton title="Accept task" icon="checkmark-circle-outline" onPress={() => Alert.alert('Accepted', 'Task marked as accepted locally.')} />
        <AppButton title="Mark complete" variant="secondary" icon="flag-outline" onPress={() => Alert.alert('Completed', 'Completion will sync with the backend.')} />
        <AppButton title="Close" variant="ghost" onPress={() => navigation.goBack()} />
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
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  summary: {
    gap: spacing.lg,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  peopleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  people: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  matchTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  matchIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  cardTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});
