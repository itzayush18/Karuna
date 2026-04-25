import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';

type Form = { fullName: string; email: string; password: string; confirmPassword: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Signup'>) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Form>({ defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' } });
  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.loading);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup({ fullName: values.fullName.trim(), email: values.email.trim(), password: values.password });
    } catch (error) {
      Alert.alert('Sign up failed', error instanceof Error ? error.message : 'Please try again.');
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
        {/* Back header */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.topBarTitle}>Create account</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.inner}>
          {/* Header section */}
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Ionicons name="person-add" size={26} color={colors.primary} />
            </View>
            <Text style={styles.title}>Join Karuna</Text>
            <Text style={styles.subtitle}>
              New accounts start as volunteers. Coordinators can promote your role once you join.
            </Text>
          </View>

          {/* Progress dots */}
          <View style={styles.stepsRow}>
            <StepDot label="Details" active />
            <View style={styles.stepLine} />
            <StepDot label="Role" active={false} />
            <View style={styles.stepLine} />
            <StepDot label="Done" active={false} />
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <SectionLabel icon="person-outline" label="Personal information" />

            <Controller
              control={control}
              name="fullName"
              rules={{
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              }}
              render={({ field }) => (
                <InputField
                  label="Full name"
                  placeholder="Your full name"
                  autoCapitalize="words"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.fullName?.message}
                  accessory={<Ionicons name="person-outline" size={18} color={errors.fullName ? colors.error : colors.muted} />}
                />
              )}
            />

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
                  placeholder="name@organisation.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.email?.message}
                  accessory={<Ionicons name="mail-outline" size={18} color={errors.email ? colors.error : colors.muted} />}
                />
              )}
            />

            <View style={styles.divider} />
            <SectionLabel icon="lock-closed-outline" label="Security" />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /(?=.*[0-9])/,
                  message: 'Password must contain at least one number',
                },
              }}
              render={({ field }) => (
                <InputField
                  label="Password"
                  placeholder="Create a strong password"
                  secureTextEntry={!showPassword}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.password?.message}
                  accessory={
                    <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={12}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                    </Pressable>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              }}
              render={({ field }) => (
                <InputField
                  label="Confirm password"
                  placeholder="Re-enter your password"
                  secureTextEntry={!showConfirm}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.confirmPassword?.message}
                  accessory={
                    <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={12}>
                      <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
                    </Pressable>
                  }
                />
              )}
            />

            {/* Password strength hint */}
            <PasswordHint password={password} />
          </View>

          {/* Role info banner */}
          <View style={styles.roleBanner}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.roleBannerText}>
              You'll be assigned the <Text style={styles.roleBold}>Volunteer</Text> role by default. Admins can upgrade your access.
            </Text>
          </View>

          {/* CTA */}
          <AppButton title="Create account" icon="checkmark-circle-outline" onPress={onSubmit} loading={loading} />

          <Text style={styles.termsNote}>
            By creating an account you agree to coordinate relief resources responsibly within the Karuna network.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon} size={14} color={colors.muted} />
      <Text style={sectionStyles.label}>{label}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
});

function StepDot({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={stepStyles.wrap}>
      <View style={[stepStyles.dot, active ? stepStyles.dotActive : stepStyles.dotInactive]}>
        {active && <View style={stepStyles.inner} />}
      </View>
      <Text style={[stepStyles.label, active ? stepStyles.labelActive : null]}>{label}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { backgroundColor: colors.border },
  inner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  label: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  labelActive: { color: colors.primary },
});

function PasswordHint({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <View style={hintStyles.row}>
      {checks.map((c) => (
        <View key={c.label} style={hintStyles.chip}>
          <Ionicons
            name={c.met ? 'checkmark-circle' : 'ellipse-outline'}
            size={13}
            color={c.met ? colors.success : colors.muted}
          />
          <Text style={[hintStyles.label, c.met ? hintStyles.met : null]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const hintStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  met: { color: colors.success },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 48 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  stepLine: {
    height: 1,
    width: 40,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#E8F0FE',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  roleBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  roleBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  termsNote: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: spacing.lg,
  },
});
