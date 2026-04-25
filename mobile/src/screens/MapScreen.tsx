import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Screen } from '../components/Screen';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing } from '../constants/theme';
import { backend } from '../services/backend';
import { useAsyncResource } from '../hooks/useAsyncResource';

function markerColor(score: number, status: string) {
  if (status === 'COMPLETED') return colors.success;
  if (score >= 70) return colors.error;
  return colors.warning;
}

export function MapScreen() {
  const tasks = useAsyncResource(() => backend.tasks(), []);
  const points = (tasks.data ?? []).filter((task) => task.location?.latitude && task.location.longitude);

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Urgent needs by village and district</Text>
      </View>
      <View style={styles.legend}>
        <StatusPill label="urgent" tone="danger" />
        <StatusPill label="moderate" tone="warn" />
        <StatusPill label="resolved" tone="good" />
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 10.35,
          longitude: 78.75,
          latitudeDelta: 3,
          longitudeDelta: 3,
        }}
      >
        {points.map((task) => {
          const score = task.urgencyScores?.[0]?.score ?? 0;
          return (
            <Marker
              key={task.id}
              coordinate={{ latitude: task.location!.latitude!, longitude: task.location!.longitude! }}
              title={task.title}
              description={`${task.category} | urgency ${score}/100`}
              pinColor={markerColor(score, task.status)}
            />
          );
        })}
      </MapView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  map: {
    flex: 1,
  },
});
