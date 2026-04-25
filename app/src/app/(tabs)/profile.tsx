import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';

export default function ProfileScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader 
        title="Priya Sharma" 
        subtitle="Level 5 Volunteer" 
        color={GoogleColors.green} 
        icon="account-circle"
      />

      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
        
        {/* Points Summary */}
        <View style={styles.pointsContainer}>
          <View style={styles.pointsBox}>
            <Text style={[styles.pointsLabel, { color: themeColors.textSecondary }]}>Total Points</Text>
            <Text style={[styles.pointsValue, { color: GoogleColors.green }]}>2,450</Text>
          </View>
        </View>

        {/* AI Coach */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Your AI Coach</Text>
        <Card style={[styles.coachCard, { borderColor: GoogleColors.blue, borderWidth: 1 }]}>
          <View style={styles.coachHeader}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
              <MaterialIcons name="smart-toy" size={24} color={GoogleColors.blue} />
            </View>
            <Text style={[styles.coachTitle, { color: themeColors.text }]}>Daily Tip</Text>
          </View>
          <Text style={[styles.coachMessage, { color: themeColors.textSecondary }]}>
            "Great job Priya! You helped 12 families last week. There's a small task near your route home today, want to check it out?"
          </Text>
        </Card>

        {/* Monthly Challenge */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Monthly Challenge</Text>
        <Card>
          <View style={styles.challengeHeader}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
              <MaterialIcons name="water-drop" size={24} color={GoogleColors.blue} />
            </View>
            <View style={styles.challengeTitleCol}>
              <Text style={[styles.challengeTitle, { color: themeColors.text }]}>Water Warrior</Text>
              <Text style={[styles.challengeSub, { color: themeColors.textSecondary }]}>Solve water problems</Text>
            </View>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: themeColors.backgroundElement }]}>
            <View style={[styles.progressFill, { backgroundColor: GoogleColors.green, width: '60%' }]} />
          </View>
          <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>3/5 Tasks Completed</Text>
        </Card>

        {/* Badges */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Your Badges</Text>
        <View style={styles.badgesGrid}>
          
          <Card style={styles.badgeCard}>
            <View style={[styles.largeIconBox, { backgroundColor: GoogleColors.red + '20' }]}>
              <MaterialIcons name="medical-services" size={32} color={GoogleColors.red} />
            </View>
            <Text style={[styles.badgeName, { color: themeColors.text }]}>First Responder</Text>
          </Card>

          <Card style={styles.badgeCard}>
            <View style={[styles.largeIconBox, { backgroundColor: GoogleColors.green + '20' }]}>
              <MaterialIcons name="translate" size={32} color={GoogleColors.green} />
            </View>
            <Text style={[styles.badgeName, { color: themeColors.text }]}>Local Voice</Text>
          </Card>

          <Card style={styles.badgeCard}>
            <View style={[styles.largeIconBox, { backgroundColor: GoogleColors.yellow + '20' }]}>
              <MaterialIcons name="bolt" size={32} color={GoogleColors.yellow} />
            </View>
            <Text style={[styles.badgeName, { color: themeColors.text }]}>Fast Actor</Text>
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
  pointsContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 24,
    zIndex: 11,
  },
  pointsBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  pointsLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pointsValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachCard: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  coachMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeTitleCol: {
    flex: 1,
  },
  challengeTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  challengeSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    textAlign: 'right',
  },
  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
  },
  largeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    textAlign: 'center',
  },
});
