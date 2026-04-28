import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleButton } from '@/components/GoogleButton';
import { CurvedHeader } from '@/components/CurvedHeader';
import { apiClient } from '@/api/client';

export default function ImpactScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      // Backend actually returns total tasks, total affected, etc.
      const response = await apiClient.get('/dashboard/urgent-summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard summary', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader 
        title="Impact" 
        subtitle="Transparent community results" 
        color={GoogleColors.blue} 
        icon="public"
      />

      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GoogleColors.blue} />
          }
        >
        
        {loading ? (
          <ActivityIndicator size="large" color={GoogleColors.blue} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Global Impact Story */}
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Community Story</Text>
            <Card style={styles.storyCard}>
              <View style={styles.storyHeader}>
                <View style={[styles.smallIconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
                  <MaterialIcons name="auto-awesome" size={16} color={GoogleColors.blue} />
                </View>
                <Text style={[styles.storyDate, { color: themeColors.textSecondary }]}>Live Summary</Text>
              </View>
              <Text style={[styles.storyMain, { color: themeColors.text }]}>
                {summary ? `Identified ${summary.totalTasks || 0} urgent community tasks affecting ${summary.totalAffectedPeople || 0} individuals.` : 'Waiting for community data...'}
              </Text>
              <Text style={[styles.storySub, { color: themeColors.textSecondary }]}>
                {"Together we're ensuring that the most critical needs are met. Real-time data keeps volunteers where they're needed most."}
              </Text>
              <View style={styles.storyFooter}>
                <View style={styles.faceGroup}>
                  <View style={[styles.faceMock, { backgroundColor: GoogleColors.green }]} />
                  <View style={[styles.faceMock, { backgroundColor: GoogleColors.yellow, marginLeft: -10 }]} />
                  <View style={[styles.faceMock, { backgroundColor: GoogleColors.red, marginLeft: -10 }]} />
                  <Text style={[styles.faceCount, { color: themeColors.textSecondary }]}>+ active volunteers</Text>
                </View>
                <MaterialIcons name="share" size={20} color={GoogleColors.blue} />
              </View>
            </Card>

            {/* Automated Reports */}
            <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Official Reports</Text>
            <Card style={styles.reportCard}>
              <View style={styles.reportRow}>
                <View style={[styles.iconBox, { backgroundColor: GoogleColors.red + '20' }]}>
                  <MaterialIcons name="picture-as-pdf" size={24} color={GoogleColors.red} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={[styles.reportTitle, { color: themeColors.text }]}>Weekly Overview</Text>
                  <Text style={[styles.reportDate, { color: themeColors.textSecondary }]}>Generated dynamically</Text>
                </View>
                <GoogleButton title="View" variant="outline" style={styles.viewBtn} textStyle={{ fontSize: 12 }} />
              </View>
            </Card>

            {/* Real-time Dashboard Stats */}
            <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>Network Pulse</Text>
            
            <View style={styles.statsRow}>
              <Card style={styles.statBox}>
                <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.blue + '20' }]}>
                  <MaterialIcons name="family-restroom" size={24} color={GoogleColors.blue} />
                </View>
                <Text style={[styles.statNumber, { color: GoogleColors.blue }]}>{summary?.totalAffectedPeople || '0'}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>People Affected</Text>
              </Card>

              <Card style={styles.statBox}>
                <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.green + '20' }]}>
                  <MaterialIcons name="task-alt" size={24} color={GoogleColors.green} />
                </View>
                <Text style={[styles.statNumber, { color: GoogleColors.green }]}>{summary?.totalTasks || '0'}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Active Needs</Text>
              </Card>
            </View>

            <View style={styles.statsRow}>
              <Card style={styles.statBox}>
                <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.yellow + '20' }]}>
                  <MaterialIcons name="place" size={24} color={GoogleColors.yellow} />
                </View>
                <Text style={[styles.statNumber, { color: GoogleColors.yellow }]}>{summary?.highSeverityTasks || '0'}</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>High Urgency</Text>
              </Card>

              <Card style={styles.statBox}>
                <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.red + '20' }]}>
                  <MaterialIcons name="timer" size={24} color={GoogleColors.red} />
                </View>
                <Text style={[styles.statNumber, { color: GoogleColors.red }]}>Live</Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Updates</Text>
              </Card>
            </View>
          </>
        )}
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
    paddingBottom: 250,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  storyCard: {
    marginBottom: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#4285F4', // Google Blue
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyDate: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  storyMain: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 12,
  },
  storySub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
    paddingTop: 16,
  },
  faceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faceMock: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  faceCount: {
    fontFamily: 'Poppins_500Medium',
    marginLeft: 12,
    fontSize: 13,
  },
  reportCard: {
    marginBottom: 16,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  reportTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  reportDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  viewBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    textAlign: 'center',
  },
});
