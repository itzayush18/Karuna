import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GoogleButton } from '@/components/GoogleButton';
import { Colors, GoogleColors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function IntroScreen() {
  const router = useRouter();
  const { dark } = useTheme();
  const bgColor = dark ? '#101010' : '#1A1C1E'; // Using dark background to make colors pop like Screenshot 1
  const textColor = '#FFFFFF'; // Always white text for contrast on dark

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      
      {/* Background Shapes Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Top Right Red Blob */}
        <View style={[styles.blob, styles.redBlob, { backgroundColor: GoogleColors.red }]} />
        
        {/* Bottom Right Green Blob */}
        <View style={[styles.blob, styles.greenBlob, { backgroundColor: GoogleColors.green }]} />
        
        {/* Bottom Left Blue Blob */}
        <View style={[styles.blob, styles.blueBlob, { backgroundColor: GoogleColors.blue }]} />
        
        {/* Floating Yellow Circle */}
        <View style={[styles.blob, styles.yellowBlob, { backgroundColor: GoogleColors.yellow }]} />
      </View>

      {/* Content Layer */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: GoogleColors.green }]}>Karuna</Text>
          </View>

          {/* Spacer to push text down slightly */}
          <View style={styles.spacer} />

          {/* Titles */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              Smart help,{'\n'}Right when it matters.
            </Text>
            
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
              AI-powered community support platform for rapid response and resource management.
            </Text>
          </View>

          {/* Action Area */}
          <View style={styles.actionContainer}>
            <GoogleButton 
              title="GET STARTED" 
              onPress={() => router.replace('/login')}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  // Base style for perfect circles used as blobs
  blob: {
    position: 'absolute',
    borderRadius: 9999, // Ensure perfect circle
  },
  redBlob: {
    width: 400,
    height: 400,
    top: -150,
    right: -100,
    opacity: 0.95,
  },
  blueBlob: {
    width: 600,
    height: 600,
    bottom: -350, // Lowered the blue circle
    left: -200,
    opacity: 0.95,
  },
  greenBlob: {
    width: 500,
    height: 500,
    bottom: -200,
    right: -250, // Pushed further to the right
    opacity: 0.9,
  },
  yellowBlob: {
    width: 100,
    height: 100,
    top: 60, // Moved further up to sit prominently on the red blob
    right: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    zIndex: 2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 24, // Clear the notch/status bar nicely
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 48,
    letterSpacing: -1,
  },
  spacer: {
    flex: 0.6, // Pushes the text group down
  },
  textContainer: {
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#000000', 
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
