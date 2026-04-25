import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleButton } from '@/components/GoogleButton';
import { CurvedHeader } from '@/components/CurvedHeader';

export default function ImpactScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

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
        >
        
        {/* Global Impact Story */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Community Story</Text>
        <Card style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <View style={[styles.smallIconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
              <MaterialIcons name="auto-awesome" size={16} color={GoogleColors.blue} />
            </View>
            <Text style={[styles.storyDate, { color: themeColors.textSecondary }]}>This Week</Text>
          </View>
          <Text style={[styles.storyMain, { color: themeColors.text }]}>
            "10 volunteers helped reduce malnutrition risk for 45 children in Village A."
          </Text>
          <Text style={[styles.storySub, { color: themeColors.textSecondary }]}>
            Without this intervention, historical data suggests a 40% chance of health decline in the affected demographic. Great job team!
          </Text>
          <View style={styles.storyFooter}>
            <View style={styles.faceGroup}>
              <View style={[styles.faceMock, { backgroundColor: GoogleColors.green }]} />
              <View style={[styles.faceMock, { backgroundColor: GoogleColors.yellow, marginLeft: -10 }]} />
              <View style={[styles.faceMock, { backgroundColor: GoogleColors.red, marginLeft: -10 }]} />
              <Text style={[styles.faceCount, { color: themeColors.textSecondary }]}>+7 more</Text>
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
              <Text style={[styles.reportTitle, { color: themeColors.text }]}>April Monthly Overview</Text>
              <Text style={[styles.reportDate, { color: themeColors.textSecondary }]}>Generated 2 days ago</Text>
            </View>
            <GoogleButton title="View" variant="outline" style={styles.viewBtn} textStyle={{ fontSize: 12 }} />
          </View>
        </Card>

        {/* Personal Impact History */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 24 }]}>Your Lifetime Impact</Text>
        
        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.blue + '20' }]}>
              <MaterialIcons name="family-restroom" size={24} color={GoogleColors.blue} />
            </View>
            <Text style={[styles.statNumber, { color: GoogleColors.blue }]}>142</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Families Helped</Text>
          </Card>

          <Card style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.green + '20' }]}>
              <MaterialIcons name="task-alt" size={24} color={GoogleColors.green} />
            </View>
            <Text style={[styles.statNumber, { color: GoogleColors.green }]}>56</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Tasks Completed</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.yellow + '20' }]}>
              <MaterialIcons name="place" size={24} color={GoogleColors.yellow} />
            </View>
            <Text style={[styles.statNumber, { color: GoogleColors.yellow }]}>12</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Areas Reached</Text>
          </Card>

          <Card style={styles.statBox}>
            <View style={[styles.statIconWrapper, { backgroundColor: GoogleColors.red + '20' }]}>
              <MaterialIcons name="timer" size={24} color={GoogleColors.red} />
            </View>
            <Text style={[styles.statNumber, { color: GoogleColors.red }]}>180h</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Time Donated</Text>
          </Card>
        </View>

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
