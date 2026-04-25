import { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { Skeleton } from '../components/Skeleton';
import { StatusPill } from '../components/StatusPill';
import { colors, radius, spacing } from '../constants/theme';
import { backend } from '../services/backend';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { Task } from '../types/api';

const center: [number, number] = [10.35, 78.75];

function markerColor(score: number, status: string) {
  if (status === 'COMPLETED') return colors.success;
  if (score >= 70) return colors.error;
  return colors.warning;
}

function markerIcon(task: Task) {
  const score = task.urgencyScores?.[0]?.score ?? 0;
  const color = markerColor(score, task.status);

  return new DivIcon({
    className: 'karuna-leaflet-marker',
    html: `<div style="
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: ${color};
      border: 3px solid #fff;
      box-shadow: 0 8px 18px rgba(60,64,67,0.28);
    "></div>`,
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

export function MapScreen() {
  const tasks = useAsyncResource(() => backend.tasks(), []);
  const points = (tasks.data ?? []).filter((task) => task.location?.latitude && task.location.longitude);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Urgent needs by village and district.</Text>
      </View>
      <View style={styles.legend}>
        <StatusPill label="urgent" tone="danger" />
        <StatusPill label="moderate" tone="warn" />
        <StatusPill label="resolved" tone="good" />
      </View>

      {tasks.loading ? (
        <Skeleton rows={3} />
      ) : (
        <Card style={styles.mapCard}>
          <View style={styles.mapShell}>
            <MapContainer center={center} zoom={7} scrollWheelZoom style={styles.leafletMap}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((task) => {
                const score = task.urgencyScores?.[0]?.score ?? 0;
                return (
                  <Marker key={task.id} position={[task.location!.latitude!, task.location!.longitude!]} icon={markerIcon(task)}>
                    <Popup>
                      <strong>{task.title}</strong>
                      <br />
                      {task.location?.village}, {task.location?.district}
                      <br />
                      {task.category} | urgency {score}/100
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </View>
        </Card>
      )}

      <View style={styles.list}>
        {points.map((task) => {
          const score = task.urgencyScores?.[0]?.score ?? 0;
          return (
            <Card key={task.id} style={styles.taskCard}>
              <View style={[styles.dot, { backgroundColor: markerColor(score, task.status) }]} />
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{task.title}</Text>
                <Text style={styles.itemMeta}>{task.location?.village}, {task.location?.district}</Text>
              </View>
              <StatusPill label={`${score}/100`} tone={score >= 70 ? 'danger' : score >= 50 ? 'warn' : 'good'} />
            </Card>
          );
        })}
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
    lineHeight: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mapCard: {
    padding: spacing.sm,
  },
  mapShell: {
    borderRadius: radius.md,
    height: 430,
    overflow: 'hidden',
  },
  leafletMap: {
    height: '100%',
    width: '100%',
  },
  list: {
    gap: spacing.md,
  },
  taskCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 3,
    height: 22,
    width: 22,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
});
