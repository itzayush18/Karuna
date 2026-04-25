import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Screen } from '../../components/Screen';
import { colors, radius, spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/auth.store';
import { AuthStackParamList } from '../../navigation/types';

type Form = { email: string; password: string };

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { email: '', password: '' } });
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <Screen padded={false}>
      <LinearGradient colors={['#4285F4', '#34A853']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>K</Text>
        </View>
        <Text style={styles.brand}>Karuna</Text>
        <Text style={styles.heroText}>Coordinate reports, volunteers, and urgent relief needs with a clean field-first workspace.</Text>
      </LinearGradient>

      <View style={styles.formWrap}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue relief coordination.</Text>
            </View>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.primary} />
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <InputField
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="name@example.com"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <InputField
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <AppButton title="Log in" icon="log-in-outline" onPress={onSubmit} loading={loading} />
          <AppButton title="Create account" variant="secondary" onPress={() => navigation.navigate('Signup')} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: spacing.md,
    paddingBottom: 78,
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  brandLetter: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  brand: {
    color: colors.white,
    fontSize: 42,
    fontWeight: '900',
  },
  heroText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 380,
  },
  formWrap: {
    marginTop: -46,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    gap: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
});
