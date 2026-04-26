import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { GoogleButton } from '@/components/GoogleButton';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';
import { apiClient } from '@/api/client';

export default function TasksScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks/urgent');
      setTasks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GoogleColors.blue} />
          }
        >
        
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Your Active Tasks</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={GoogleColors.blue} style={{ marginTop: 40 }} />
        ) : tasks.length === 0 ? (
          <Text style={{ color: themeColors.textSecondary, textAlign: 'center', marginTop: 40 }}>No active tasks found.</Text>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={[styles.iconBox, { backgroundColor: GoogleColors.red + '20' }]}>
                  <MaterialIcons name="medical-services" size={24} color={GoogleColors.red} />
                </View>
                <View style={styles.taskTitleCol}>
                  <Text style={[styles.taskTitle, { color: themeColors.text }]}>{task.type || 'Support Task'}</Text>
                  <Text style={[styles.taskSubtitle, { color: themeColors.textSecondary }]}>{task.status}</Text>
                </View>
                <UrgencyBadge level={task.urgencyScore > 80 ? 'high' : task.urgencyScore > 50 ? 'medium' : 'low'} />
              </View>
              
              <View style={[styles.reasonBox, { backgroundColor: GoogleColors.blue + '15' }]}>
                <MaterialIcons name="info" size={18} color={GoogleColors.blue} style={styles.reasonIcon} />
                <Text style={[styles.reasonText, { color: GoogleColors.blue }]}>
                  {task.urgencyExplanation?.reason || 'AI identified this as an urgent community need.'}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="group" size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>{task.urgencyExplanation?.affectedPeople || 0} Affected</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="analytics" size={16} color={themeColors.textSecondary} />
                  <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>Score: {task.urgencyScore}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <GoogleButton title="Accept" variant="primary" style={[styles.actionBtn, { backgroundColor: GoogleColors.blue }]} />
                <GoogleButton title="Decline" variant="outline" style={styles.actionBtn} />
              </View>
            </Card>
          ))
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
