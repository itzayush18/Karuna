import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { GoogleButton } from '@/components/GoogleButton';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';

export default function TasksScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader 
        title="Smart Matches" 
        subtitle="Tasks optimized for you" 
        color={GoogleColors.yellow} 
        icon="auto-awesome"
      />

      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
        
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Your Active Tasks</Text>
        
        <Card style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.red + '20' }]}>
              <MaterialIcons name="medical-services" size={24} color={GoogleColors.red} />
            </View>
            <View style={styles.taskTitleCol}>
              <Text style={[styles.taskTitle, { color: themeColors.text }]}>Medical Check</Text>
              <Text style={[styles.taskSubtitle, { color: themeColors.textSecondary }]}>Tambaram</Text>
            </View>
            <UrgencyBadge level="high" />
          </View>
          
          <View style={[styles.reasonBox, { backgroundColor: GoogleColors.blue + '15' }]}>
            <MaterialIcons name="info" size={18} color={GoogleColors.blue} style={styles.reasonIcon} />
            <Text style={[styles.reasonText, { color: GoogleColors.blue }]}>
              Assigned because you are 2km away, know First Aid, and speak Tamil.
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>Due in 2h</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="group" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>5 Elderly</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <GoogleButton title="Accept" variant="primary" style={[styles.actionBtn, { backgroundColor: GoogleColors.blue }]} />
            <GoogleButton title="Decline" variant="outline" style={styles.actionBtn} />
          </View>
        </Card>

        <Card style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.green + '20' }]}>
              <MaterialIcons name="restaurant" size={24} color={GoogleColors.green} />
            </View>
            <View style={styles.taskTitleCol}>
              <Text style={[styles.taskTitle, { color: themeColors.text }]}>Food Distribution</Text>
              <Text style={[styles.taskSubtitle, { color: themeColors.textSecondary }]}>Sector 4</Text>
            </View>
            <UrgencyBadge level="medium" />
          </View>
          
          <View style={[styles.reasonBox, { backgroundColor: GoogleColors.blue + '15' }]}>
            <MaterialIcons name="info" size={18} color={GoogleColors.blue} style={styles.reasonIcon} />
            <Text style={[styles.reasonText, { color: GoogleColors.blue }]}>
              Matched due to your past performance in logistics and low fatigue level.
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MaterialIcons name="schedule" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>Tomorrow 8 AM</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <GoogleButton title="Accept" variant="primary" style={[styles.actionBtn, { backgroundColor: GoogleColors.blue }]} />
            <GoogleButton title="Decline" variant="outline" style={styles.actionBtn} />
          </View>
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
    paddingBottom: 250,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  taskCard: {
    marginBottom: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  taskTitleCol: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  taskSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  reasonBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  reasonIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  reasonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
});
