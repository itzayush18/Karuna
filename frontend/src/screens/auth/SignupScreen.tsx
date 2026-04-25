import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';

type Form = { fullName: string; email: string; password: string };

export function SignupScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Signup'>) {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { fullName: '', email: '', password: '' } });
  const signup = useAuthStore((state) => state.signup);
  const loading = useAuthStore((state) => state.loading);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup(values);
    } catch (error) {
      Alert.alert('Signup failed', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>New users start as volunteers and can be promoted by coordinators.</Text>
      </View>
      <Card style={styles.form}>
        <Controller control={control} name="fullName" render={({ field }) => <InputField label="Full name" placeholder="Your name" value={field.value} onChangeText={field.onChange} />} />
        <Controller control={control} name="email" render={({ field }) => <InputField label="Email" placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} />} />
        <Controller control={control} name="password" render={({ field }) => <InputField label="Password" placeholder="Create a password" autoCapitalize="none" secureTextEntry value={field.value} onChangeText={field.onChange} />} />
        <AppButton title="Sign up" icon="person-add-outline" onPress={onSubmit} loading={loading} />
        <AppButton title="Back to login" variant="secondary" onPress={() => navigation.goBack()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    paddingTop: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
});
