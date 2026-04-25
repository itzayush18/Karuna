import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';
import MapView, { Marker, UrlTile } from 'react-native-maps';

export default function DashboardScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];
  const mapRef = React.useRef<MapView>(null);

  const handleZoom = async (zoomIn: boolean) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.zoom = zoomIn ? (camera.zoom || 10) + 1 : (camera.zoom || 10) - 1;
      if (camera.altitude) {
        camera.altitude = zoomIn ? camera.altitude / 2 : camera.altitude * 2;
      }
      mapRef.current?.animateCamera(camera, { duration: 300 });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader title="Karuna Dashboard" subtitle="Live Urgency & Alerts" color={GoogleColors.blue} />
      
      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
        
        {/* BENTO GRID LAYOUT */}
        
        {/* Full Width Alert (Yellow) */}
        <Card style={[styles.bentoCard, { backgroundColor: GoogleColors.yellow }]}>
          <View style={styles.alertHeader}>
            <MaterialIcons name="warning" size={24} color="#000" />
            <Text style={[styles.bentoTitle, { color: '#000', marginLeft: 8 }]}>Early Warning</Text>
          </View>
          <Text style={[styles.bentoText, { color: '#000' }]}>
            Food shortage risk increasing in Kanchipuram taluk in the next 3 weeks.
          </Text>
        </Card>

        {/* Middle Row (Split 60 / 40) */}
        <View style={styles.bentoRow}>
          
          {/* Large Map Card */}
          <Card style={[styles.bentoCard, styles.mapCard, { padding: 0, overflow: 'hidden' }]}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: 12.8231,
                longitude: 80.0453,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
              mapType="none"
              zoomEnabled={true}
              scrollEnabled={true}
              zoomControlEnabled={false} // We will use custom leaflet-style buttons
            >
              <UrlTile
                urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              <Marker coordinate={{ latitude: 12.83, longitude: 80.05 }} pinColor={GoogleColors.red} />
              <Marker coordinate={{ latitude: 12.90, longitude: 80.10 }} pinColor={GoogleColors.yellow} />
              <Marker coordinate={{ latitude: 12.75, longitude: 79.90 }} pinColor={GoogleColors.green} />
            </MapView>
            
            <View style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
              <MaterialIcons name="map" size={32} color="#000" style={styles.bentoIcon} />
              <Text style={[styles.bentoTitle, { color: '#000', textShadowColor: 'rgba(255,255,255,0.8)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 }]}>Live Map</Text>
            </View>

            {/* Custom Leaflet-style Zoom Controls */}
            <View style={{ position: 'absolute', right: 16, bottom: 20, backgroundColor: '#FFF', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 5 }}>
              <Text 
                onPress={() => handleZoom(true)}
                style={{ fontSize: 24, fontWeight: 'bold', color: '#333', paddingHorizontal: 12, paddingVertical: 4, textAlign: 'center', backgroundColor: '#FFF' }}
              >
                +
              </Text>
              <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
              <Text 
                onPress={() => handleZoom(false)}
                style={{ fontSize: 24, fontWeight: 'bold', color: '#333', paddingHorizontal: 12, paddingVertical: 4, textAlign: 'center', backgroundColor: '#FFF' }}
              >
                −
              </Text>
            </View>
            
            <View style={{ position: 'absolute', bottom: 20, left: 20, pointerEvents: 'none', backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={[styles.bentoText, { color: '#000', marginTop: 0, fontFamily: 'Poppins_700Bold' }]}>
                3 Active Zones
              </Text>
            </View>
          </Card>

          {/* Stacked Right Column */}
          <View style={styles.stackedCol}>
            <Card style={[styles.bentoCard, styles.smallCard, { backgroundColor: GoogleColors.green }]}>
              <MaterialIcons name="check-circle" size={28} color="#FFF" style={styles.bentoIcon} />
              <Text style={[styles.bentoTitle, { color: '#FFF' }]}>Resolved</Text>
              <Text style={[styles.bentoValue, { color: '#FFF' }]}>24</Text>
            </Card>

            <Card style={[styles.bentoCard, styles.smallCard, { backgroundColor: themeColors.surface, borderWidth: 1, borderColor: themeColors.border }]}>
              <MaterialIcons name="group" size={28} color={GoogleColors.blue} style={styles.bentoIcon} />
              <Text style={[styles.bentoTitle, { color: themeColors.text }]}>Active</Text>
              <Text style={[styles.bentoValue, { color: GoogleColors.blue }]}>14</Text>
            </Card>
          </View>

        </View>

        {/* Bottom Full Width Urgent Needs (Red) */}
        <Card style={[styles.bentoCard, { backgroundColor: GoogleColors.red }]}>
          <View style={styles.needHeader}>
            <MaterialIcons name="local-hospital" size={28} color="#FFF" />
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>92</Text>
            </View>
          </View>
          <Text style={[styles.bentoTitle, { color: '#FFF', marginTop: 12 }]}>Medical Supply Shortage</Text>
          <Text style={[styles.bentoText, { color: '#FFF' }]}>
            Urgent need for first aid kits. 50+ elderly affected in Village A. Unresolved for 2 days.
          </Text>
        </Card>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 250, // Massive space to ensure nothing hides behind FAB
  },
  bentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bentoCard: {
    padding: 24,
    borderRadius: 32, // Maximum smoothness
    marginBottom: 16,
  },
  topCardsContainer: {
    marginTop: 0,
    marginBottom: 20,
    zIndex: 10,
  },
  mapCard: {
    width: '58%',
    minHeight: 220,
    marginBottom: 0,
  },
  stackedCol: {
    width: '38%',
    justifyContent: 'space-between',
  },
  smallCard: {
    flex: 1,
    padding: 16,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bentoIcon: {
    marginBottom: 8,
  },
  bentoTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  bentoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  bentoValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    marginTop: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapGraphic: {
    flex: 1,
    width: '100%',
    position: 'relative',
    marginTop: 12,
  },
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  needHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scoreBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  scoreText: {
    fontFamily: 'Poppins_700Bold',
    color: GoogleColors.red,
    fontSize: 14,
  },
});
