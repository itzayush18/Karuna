import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { Task } from '../types/api';
import { Card } from './Card';
import { StatusPill } from './StatusPill';

export function TaskCard({ task, onPress }: { task: Task; onPress?: () => void }) {
  const score = task.urgencyScores?.[0]?.score ?? 0;
  const tone = score >= 75 ? 'danger' : score >= 50 ? 'warn' : 'good';
  const progressColor = score >= 75 ? colors.error : score >= 50 ? colors.warning : colors.success;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.pressed : null]}>
      <Card>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Text style={styles.location}>{task.location?.village ?? 'Unknown area'}, {task.location?.district ?? 'Unknown district'}</Text>
            </View>
          </View>
          <StatusPill label={score >= 75 ? 'Urgent' : score >= 50 ? 'Medium' : 'Stable'} tone={tone} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progress, { width: `${Math.min(score, 100)}%`, backgroundColor: progressColor }]} />
        </View>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={15} color={colors.primary} />
            <Text style={styles.metaText}>{task.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={15} color={colors.muted} />
            <Text style={styles.metaMuted}>{task.affectedPeople} affected</Text>
          </View>
          <Text style={styles.score}>{score}/100</Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  location: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 8,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 999,
    height: '100%',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metaText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  metaMuted: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  score: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 'auto',
  },
});
