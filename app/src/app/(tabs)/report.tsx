import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Colors, GoogleColors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { GoogleButton } from '@/components/GoogleButton';
import { MaterialIcons } from '@expo/vector-icons';
import { CurvedHeader } from '@/components/CurvedHeader';

export default function ReportScreen() {
  const { dark } = useTheme();
  const themeColors = Colors[dark ? 'dark' : 'light'];

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
          <Card style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.blue + '20' }]}>
              <MaterialIcons name="camera-alt" size={28} color={GoogleColors.blue} />
            </View>
            <Text style={[styles.gridTitle, { color: themeColors.text }]}>Scan</Text>
            <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Paper Survey</Text>
          </Card>
          
          <Card style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.red + '20' }]}>
              <MaterialIcons name="mic" size={28} color={GoogleColors.red} />
            </View>
            <Text style={[styles.gridTitle, { color: themeColors.text }]}>Voice</Text>
            <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>In Tamil</Text>
          </Card>

          <Card style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.green + '20' }]}>
              <MaterialIcons name="chat" size={28} color={GoogleColors.green} />
            </View>
            <Text style={[styles.gridTitle, { color: themeColors.text }]}>WhatsApp</Text>
            <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Forwarded</Text>
          </Card>

          <Card style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: GoogleColors.yellow + '20' }]}>
              <MaterialIcons name="edit-document" size={28} color={GoogleColors.yellow} />
            </View>
            <Text style={[styles.gridTitle, { color: themeColors.text }]}>Manual</Text>
            <Text style={[styles.gridDesc, { color: themeColors.textSecondary }]}>Type details</Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Quick Text Report</Text>
        <Card style={styles.formCard}>
          <TextInput 
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.backgroundElement }]}
            placeholder="Type short or unclear message here... AI will understand."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <GoogleButton 
            title="Submit Report" 
            icon="send" 
            style={{ marginTop: 16, backgroundColor: GoogleColors.red }} 
          />
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
  gridItem: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
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
});
