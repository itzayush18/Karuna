import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GoogleButton } from '@/components/GoogleButton';
import { Colors, GoogleColors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { apiClient } from '@/api/client';

export interface Organization {
  id: string;
  name: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { dark } = useTheme();
  const { register } = useAuth();
  const bgColor = dark ? '#101010' : '#1A1C1E';
  const textColor = '#FFFFFF';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([]);
  const [isOrgModalVisible, setOrgModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await apiClient.get('/auth/organizations');
        setOrganizationsList(response.data.data);
      } catch (err) {
        console.error('Failed to load organizations', err);
      }
    };
    fetchOrgs();
  }, []);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !organization) {
      Alert.alert('Error', 'Please fill in all fields and select an organization');
      return;
    }

    try {
      setIsLoading(true);
      await register(email, fullName, password, organization.id);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Sign Up Failed', error?.response?.data?.message || error?.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>

      {/* Background Shapes Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={[styles.blob, styles.greenBlob, { backgroundColor: GoogleColors.green }]} />
        <View style={[styles.blob, styles.yellowBlob, { backgroundColor: GoogleColors.yellow }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.logoText, { color: GoogleColors.blue }]}>Karuna</Text>
            <Text style={[styles.title, { color: textColor }]}>Join Us</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>Create your volunteer account</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Full Name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={fullName}
              onChangeText={setFullName}
            />
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

            <TouchableOpacity
              style={[styles.input, styles.dropdownInput]}
              onPress={() => setOrgModalVisible(true)}
            >
              <Text style={{ color: organization ? textColor : 'rgba(255,255,255,0.5)', fontFamily: 'Poppins_400Regular', fontSize: 16 }}>
                {organization ? organization.name : 'Select Organization'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="large" color={GoogleColors.blue} style={styles.loader} />
            ) : (
              <GoogleButton
                title="SIGN UP"
                onPress={handleSignUp}
                style={styles.button}
                textStyle={styles.buttonText}
              />
            )}

            <TouchableOpacity style={styles.switchContainer} onPress={() => router.push('/login')}>
              <Text style={styles.switchText}>Already have an account? <Text style={{ color: GoogleColors.blue, fontFamily: 'Poppins_700Bold' }}>Sign In</Text></Text>
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>

      <Modal visible={isOrgModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Organization</Text>
            <FlatList
              data={organizationsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.orgItem, organization?.id === item.id && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => {
                    setOrganization(item);
                    setOrgModalVisible(false);
                  }}
                >
                  <Text style={[styles.orgName, { color: textColor }]}>{item.name}</Text>
                  {organization?.id === item.id && <MaterialIcons name="check" size={20} color={GoogleColors.green} />}
                </TouchableOpacity>
              )}
            />
            <GoogleButton
              title="Cancel"
              variant="outline"
              style={{ marginTop: 16 }}
              onPress={() => setOrgModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

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
  greenBlob: {
    width: 400,
    height: 400,
    top: -150,
    right: -100,
    opacity: 0.7,
  },
  yellowBlob: {
    width: 600,
    height: 600,
    bottom: -300,
    left: -200,
    opacity: 0.6,
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
    gap: 16,
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
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  orgItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  orgName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
  }
});
