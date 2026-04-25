import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../../components/AppButton';
import { InputField } from '../../components/InputField';
import { colors, radius, shadows, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/auth.store';
import { AuthStackParamList } from '../../navigation/types';

type Form = { email: string; password: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ defaultValues: { email: '', password: '' } });
  const login = useAuthStore((state) => state.login);
  const loginDemo = useAuthStore((state) => state.loginDemo);
  const loading = useAuthStore((state) => state.loading);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email.trim(), values.password);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Invalid email or password. Please try again.',
      );
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <LinearGradient
          colors={['#1a73e8', '#34A853']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Background decoration */}
          <View style={styles.heroDeco1} />
          <View style={styles.heroDeco2} />

          <View style={styles.heroContent}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoLetter}>K</Text>
            </View>
            <Text style={styles.appName}>Karuna</Text>
            <Text style={styles.tagline}>
              Field-first relief coordination — connect volunteers, reports, and urgent needs.
            </Text>
          </View>

          {/* Stat chips */}
          <View style={styles.statsRow}>
            <StatChip icon="people-outline" value="2.4k" label="Volunteers" />
            <StatChip icon="document-text-outline" value="18k" label="Reports" />
            <StatChip icon="flash-outline" value="94%" label="Resolved" />
          </View>
        </LinearGradient>

        {/* Form card */}
        <View style={styles.formWrap}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSub}>Sign in to continue coordinating relief efforts.</Text>
              </View>
              <View style={styles.shieldBadge}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
              </View>
            </View>

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: { value: EMAIL_REGEX, message: 'Enter a valid email address' },
              }}
              render={({ field }) => (
                <InputField
                  label="Email address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="name@organisation.com"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.email?.message}
                  accessory={
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={errors.email ? colors.error : colors.muted}
                    />
                  }
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              }}
              render={({ field }) => (
                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.password?.message}
                  accessory={
                    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={12}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.muted}
                      />
                    </Pressable>
                  }
                />
              )}
            />

            {/* Actions */}
            <AppButton title="Sign in" icon="log-in-outline" onPress={onSubmit} loading={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Demo login — bypasses backend for testing */}
            <Pressable
              style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed]}
              onPress={loginDemo}
              disabled={loading}
            >
              <Ionicons name="rocket-outline" size={16} color="#7C3AED" />
              <Text style={styles.demoBtnText}>Continue with Demo Account</Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>No backend needed</Text>
              </View>
            </Pressable>

            <AppButton
              title="Create an account"
              variant="secondary"
              icon="person-add-outline"
              onPress={() => navigation.navigate('Signup')}
            />

            <Text style={styles.footnote}>
              By signing in, you agree to coordinate relief resources responsibly.
            </Text>
          </View>

          {/* Role badges */}
          <View style={styles.rolesRow}>
            <RoleBadge icon="shield-outline" label="Admin" color="#EA4335" />
            <RoleBadge icon="people-outline" label="Coordinator" color="#FBBC05" />
            <RoleBadge icon="walk-outline" label="Field Worker" color="#34A853" />
            <RoleBadge icon="hand-left-outline" label="Volunteer" color="#4285F4" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StatChip({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color="rgba(255,255,255,0.85)" />
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function RoleBadge({ icon, label, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }) {
  return (
    <View style={[styles.roleBadge, { borderColor: color + '33' }]}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.roleLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero
  hero: {
    paddingTop: 68,
    paddingBottom: 72,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -60,
  },
  heroDeco2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 20,
    left: -40,
  },
  heroContent: {
    gap: spacing.md,
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  logoLetter: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1a73e8',
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    maxWidth: 340,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  chipValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chipLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  // Form
  formWrap: {
    marginTop: -40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: typography.subtitle,
    fontWeight: '900',
    color: colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  shieldBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 17,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  demoBtnPressed: {
    backgroundColor: '#EDE9FE',
    opacity: 0.9,
  },
  demoBtnText: {
    color: '#7C3AED',
    fontSize: 15,
    fontWeight: '800',
  },
  demoBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
