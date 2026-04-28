import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GoogleButton } from '@/components/GoogleButton';
import { Colors, GoogleColors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { dark } = useTheme();
  const { login } = useAuth();
  const bgColor = dark ? '#101010' : '#1A1C1E';
  const textColor = '#FFFFFF';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login Failed', error?.response?.data?.message || error?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>

      {/* Background Shapes Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={[styles.blob, styles.redBlob, { backgroundColor: GoogleColors.red }]} />
        <View style={[styles.blob, styles.blueBlob, { backgroundColor: GoogleColors.blue }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.logoText, { color: GoogleColors.green }]}>Karuna</Text>
            <Text style={[styles.title, { color: textColor }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.passwordField}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: textColor }]}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeButton} onPress={() => setShowPassword((value) => !value)}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="rgba(255,255,255,0.7)" />
              </Pressable>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={GoogleColors.blue} style={styles.loader} />
            ) : (
              <GoogleButton
                title="SIGN IN"
                onPress={handleLogin}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            )}

            <TouchableOpacity style={styles.switchContainer} onPress={() => router.push('/signup')}>
              <Text style={styles.switchText}>{"Don't have an account? "}<Text style={{ color: GoogleColors.red, fontFamily: 'Poppins_700Bold' }}>Sign Up</Text></Text>
            </TouchableOpacity>

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
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  redBlob: {
    width: 400,
    height: 400,
    top: -150,
    right: -100,
    opacity: 0.8,
  },
  blueBlob: {
    width: 600,
    height: 600,
    bottom: -300,
    left: -200,
    opacity: 0.8,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    zIndex: 10,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    lineHeight: 44,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
  },
  formContainer: {
    gap: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 18,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  passwordField: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 56,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  loader: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 10,
    alignItems: 'center',
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
  switchContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  }
});
