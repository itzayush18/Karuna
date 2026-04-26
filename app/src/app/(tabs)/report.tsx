import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, TouchableOpacity, Linking, Modal } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { GoogleButton } from '@/components/GoogleButton';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';
import { apiClient } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

// We use dynamic imports/requires for native modules to prevent the app from crashing
// if the development build hasn't been recompiled yet.
let ImagePicker: any;
let Audio: any;

try {
  ImagePicker = require('expo-image-picker');
  Audio = require('expo-av').Audio;
} catch (e) {
  console.warn('Native modules for Camera/Audio not found. Please rebuild the app.');
}

export default function ReportScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];
  const { user } = useAuth();
  
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const inputRef = useRef<TextInput>(null);

  const uploadMedia = async (reportId: string, uri: string, type: 'image' | 'audio') => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const fileType = match ? `${type}/${match[1]}` : type;

    // @ts-ignore
    formData.append('file', {
      uri,
      name: filename,
      type: fileType,
    });

    try {
      await apiClient.post(`/reports/${reportId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Media upload failed', error);
      throw error;
    }
  };

  const handleScan = async () => {
    if (!ImagePicker || typeof ImagePicker.requestCameraPermissionsAsync !== 'function') {
      Alert.alert('Module not found', 'Camera features require a rebuild (npx expo run:ios).');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to scan reports.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsSubmitting(true);
      try {
        const reportRes = await apiClient.post('/reports', {
          source: 'IMAGE',
          idempotencyKey: `report-img-${Date.now()}`
        });
        await uploadMedia(reportRes.data.data.id, result.assets[0].uri, 'image');
        Alert.alert('Success', 'Image report submitted successfully.');
      } catch (error) {
        Alert.alert('Error', 'Failed to submit image report.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVoice = async () => {
    if (isRecording) {
      setIsRecording(false);
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      setRecording(null);

      if (uri) {
        setIsSubmitting(true);
        try {
          const reportRes = await apiClient.post('/reports', {
            source: 'AUDIO',
            idempotencyKey: `report-audio-${Date.now()}`
          });
          await uploadMedia(reportRes.data.data.id, uri, 'audio');
          Alert.alert('Success', 'Voice report submitted successfully.');
        } catch (error) {
          Alert.alert('Error', 'Failed to submit voice report.');
        } finally {
          setIsSubmitting(false);
        }
      }
      return;
    }

    if (!Audio || typeof Audio.requestPermissionsAsync !== 'function') {
      Alert.alert('Module not found', 'Voice features require a rebuild (npx expo run:ios).');
      return;
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Microphone access is required for voice reports.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const handleWhatsApp = async () => {
    const url = 'whatsapp://send?text=Hi Karuna, I have a report to share.';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('WhatsApp not found', 'Please install WhatsApp to use this feature.');
    }
  };

  const [isManualModalVisible, setManualModalVisible] = useState(false);

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      Alert.alert('Empty Report', 'Please enter some text before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/reports', {
        source: 'TEXT',
        rawText: reportText,
        idempotencyKey: `report-${Date.now()}`
      });
      
      Alert.alert('Success', 'Report submitted successfully. AI is processing it.');
      setReportText('');
    } catch (error) {
      console.error('Submission failed', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManual = () => {
    setManualModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <CurvedHeader 
        title="Smart Report" 
        subtitle="AI extracts data from anything" 
        color={GoogleColors.red} 
        icon="add-circle-outline"
      />

      <View style={{ flex: 1, position: 'relative', zIndex: 1, elevation: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
        
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Submit Info</Text>
          <View style={[styles.offlineBadge, { backgroundColor: GoogleColors.green + '20' }]}>
            <MaterialIcons name="cloud-done" size={14} color={GoogleColors.green} />
            <Text style={[styles.offlineText, { color: GoogleColors.green }]}> Sync Active</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItemWrapper} onPress={handleScan}>
            <Card style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
                <MaterialIcons name="camera-alt" size={28} color={GoogleColors.blue} />
              </View>
              <Text style={[styles.gridTitle, { color: themeColors.text }]}>Scan</Text>
              <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Paper Survey</Text>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.gridItemWrapper} onPress={handleVoice}>
            <Card style={[styles.gridItem, isRecording && { backgroundColor: GoogleColors.red + '10', borderColor: GoogleColors.red, borderWidth: 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: isRecording ? GoogleColors.red : GoogleColors.red + '20' }]}>
                <MaterialIcons name={isRecording ? "stop" : "mic"} size={28} color={isRecording ? "#FFF" : GoogleColors.red} />
              </View>
              <Text style={[styles.gridTitle, { color: themeColors.text }]}>{isRecording ? "Stop" : "Voice"}</Text>
              <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>{isRecording ? "Recording..." : "Any Language"}</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItemWrapper} onPress={handleWhatsApp}>
            <Card style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: GoogleColors.green + '20' }]}>
                <MaterialIcons name="chat" size={28} color={GoogleColors.green} />
              </View>
              <Text style={[styles.gridTitle, { color: themeColors.text }]}>WhatsApp</Text>
              <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Forwarded</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItemWrapper} onPress={handleManual}>
            <Card style={styles.gridItem}>
              <View style={[styles.iconBox, { backgroundColor: GoogleColors.yellow + '20' }]}>
                <MaterialIcons name="edit-document" size={28} color={GoogleColors.yellow} />
              </View>
              <Text style={[styles.gridTitle, { color: themeColors.text }]}>Manual</Text>
              <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Type details</Text>
            </Card>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Quick Text Report</Text>
        <Card style={styles.formCard}>
          <TextInput 
            ref={inputRef}
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundElement }]}
            placeholder="Type short or unclear message here... AI will understand."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={reportText}
            onChangeText={setReportText}
            editable={!isSubmitting}
          />
          {isSubmitting ? (
            <ActivityIndicator size="large" color={GoogleColors.red} style={{ marginTop: 16 }} />
          ) : (
            <GoogleButton 
              title="Submit Report" 
              icon="send" 
              style={{ marginTop: 16, backgroundColor: GoogleColors.red }} 
              onPress={handleSubmit}
            />
          )}
        </Card>

        </ScrollView>
      </View>

      <Modal visible={isManualModalVisible} animationType="slide">
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Manual Report</Text>
            <TouchableOpacity onPress={() => setManualModalVisible(false)}>
              <MaterialIcons name="close" size={28} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          <TextInput
            autoFocus
            style={[styles.manualInput, { color: themeColors.text, backgroundColor: themeColors.backgroundElement }]}
            placeholder="Start typing your report here... it works like a notes app."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            textAlignVertical="top"
            value={reportText}
            onChangeText={setReportText}
          />
          <GoogleButton
            title="Save & Submit"
            icon="check"
            style={{ margin: 20, backgroundColor: GoogleColors.green }}
            onPress={async () => {
              setManualModalVisible(false);
              await handleSubmit();
            }}
          />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  gridItem: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  gridDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  formCard: {
    padding: 20,
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    minHeight: 120,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
  },
  manualInput: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    lineHeight: 28,
  },
});
