import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';
import { useAuth } from '@/context/AuthContext';
import { GoogleButton } from '@/components/GoogleButton';

export default function ProfileScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];
  const { user, logout } = useAuth();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [localName, setLocalName] = useState(user?.fullName || user?.email?.split('@')[0] || 'Volunteer');
  const [editName, setEditName] = useState(localName);

  useEffect(() => {
    const nextName = user?.fullName || user?.email?.split('@')[0] || 'Volunteer';
    setLocalName(nextName);
    setEditName(nextName);
  }, [user?.email, user?.fullName]);

  const handleSaveProfile = async () => {
    try {
      setLocalName(editName);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated locally.');
    } catch (e) {
      Alert.alert('Error', 'Could not save profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader
        title={localName}
        subtitle={`Role: ${user?.role || 'Volunteer'}`}
        color={GoogleColors.green}
        icon="account-circle"
      />

      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Actions Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: GoogleColors.blue + '15' }]}
              onPress={() => setEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={20} color={GoogleColors.blue} />
              <Text style={[styles.actionBtnText, { color: GoogleColors.blue }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: GoogleColors.red + '15' }]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={GoogleColors.red} />
              <Text style={[styles.actionBtnText, { color: GoogleColors.red }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* Points Summary */}
          <View style={styles.pointsContainer}>
            <View style={styles.pointsBox}>
              <Text style={[styles.pointsLabel, { color: themeColors.textSecondary }]}>Total Points</Text>
              <Text style={[styles.pointsValue, { color: GoogleColors.green }]}>{user?.points ?? 0}</Text>
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
              {`"Great job ${localName.split(' ')[0]}! You helped 12 families last week. There's a small task near your route home today, want to check it out?"`}
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

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.background }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Edit Profile</Text>

            <Text style={[styles.inputLabel, { color: themeColors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor={themeColors.textSecondary}
            />

            <View style={styles.modalActions}>
              <GoogleButton
                title="Cancel"
                variant="outline"
                style={styles.modalBtn}
                onPress={() => setEditModalVisible(false)}
              />
              <GoogleButton
                title="Save"
                style={[styles.modalBtn, { backgroundColor: GoogleColors.blue }]}
                onPress={handleSaveProfile}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
  },
});
