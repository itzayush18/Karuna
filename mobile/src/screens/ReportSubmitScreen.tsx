import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { InputField } from '../components/InputField';
import { Screen } from '../components/Screen';
import { StatusPill } from '../components/StatusPill';
import { colors, radius, spacing } from '../constants/theme';
import { backend } from '../services/backend';
import { useOfflineStore } from '../store/offline.store';

type Form = {
  rawText: string;
  category: string;
  affectedPeople: string;
  village: string;
};

export function ReportSubmitScreen() {
  const { control, handleSubmit, reset, watch } = useForm<Form>({
    defaultValues: { rawText: '', category: '', affectedPeople: '', village: '' },
  });
  const enqueueReport = useOfflineStore((state) => state.enqueueReport);
  const queue = useOfflineStore((state) => state.queue);
  const preview = watch();

  const submit = handleSubmit(async (values) => {
    const idempotencyKey = `mobile-${Date.now()}`;
    const payload = {
      source: 'TEXT' as const,
      rawText: values.rawText,
      formData: {
        category: values.category,
        affectedPeople: Number(values.affectedPeople || 0),
        village: values.village,
      },
      idempotencyKey,
    };
    const network = await NetInfo.fetch();
    if (!network.isConnected) {
      await enqueueReport(payload);
      Alert.alert('Saved offline', 'This report will sync automatically when internet returns.');
      reset();
      return;
    }
    try {
      await backend.submitReport(payload);
      Alert.alert('Report submitted', 'AI extraction will process this report shortly.');
      reset();
    } catch {
      await enqueueReport(payload);
      Alert.alert('Queued for sync', 'Backend was unavailable, so the report was saved offline.');
      reset();
    }
  });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) Alert.alert('Image ready', 'Image capture is ready to attach to a backend report flow.');
  }

  async function recordAudio() {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Microphone needed', 'Allow microphone access to record Tamil or English voice notes.');
      return;
    }
    Alert.alert('Recorder ready', 'Recording UI placeholder is ready for expo-av integration.');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Submit report</Text>
        <Text style={styles.subtitle}>Capture field notes, media, and affected-area details.</Text>
      </View>

      <Card style={styles.queueCard}>
        <View style={styles.queueTop}>
          <View style={styles.queueIcon}>
            <Ionicons name="cloud-upload-outline" size={23} color={colors.primary} />
          </View>
          <View style={styles.queueCopy}>
            <Text style={styles.cardTitle}>Offline queue</Text>
            <Text style={styles.cardText}>Reports sync automatically when the network returns.</Text>
          </View>
          <StatusPill label={`${queue.length} pending`} tone={queue.length ? 'warn' : 'good'} />
        </View>
      </Card>

      <Card style={styles.form}>
        <Controller
          control={control}
          name="rawText"
          render={({ field }) => (
            <InputField
              label="Field notes"
              placeholder="WhatsApp-style message or field notes"
              multiline
              textAlignVertical="top"
              style={styles.notesInput}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller control={control} name="category" render={({ field }) => <InputField label="Category" placeholder="Food, water, medical..." value={field.value} onChangeText={field.onChange} />} />
        <Controller control={control} name="affectedPeople" render={({ field }) => <InputField label="Affected people" placeholder="Number of people" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} />} />
        <Controller control={control} name="village" render={({ field }) => <InputField label="Village / area" placeholder="Village or neighborhood" value={field.value} onChangeText={field.onChange} />} />
      </Card>

      <View style={styles.mediaRow}>
        <MediaButton icon="image-outline" label="Image" onPress={pickImage} />
        <MediaButton icon="mic-outline" label="Audio" onPress={recordAudio} />
        <MediaButton icon="document-text-outline" label="Text" onPress={() => Alert.alert('Text mode', 'Use the field notes area above.')} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Preview</Text>
        <Text style={styles.previewText}>{preview.rawText || 'Report summary will appear here as you type.'}</Text>
        <View style={styles.previewMeta}>
          <StatusPill label={preview.category || 'category'} />
          <StatusPill label={`${preview.affectedPeople || 0} people`} tone="warn" />
          <StatusPill label={preview.village || 'area'} tone="good" />
        </View>
      </Card>

      <AppButton title="Submit report" icon="send-outline" onPress={submit} />
    </Screen>
  );
}

function MediaButton({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mediaButton, pressed ? styles.mediaPressed : null]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.mediaLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  queueCard: {
    gap: spacing.md,
  },
  queueTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  queueIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  queueCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  form: {
    gap: spacing.lg,
  },
  notesInput: {
    minHeight: 112,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mediaButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 82,
    justifyContent: 'center',
  },
  mediaPressed: {
    opacity: 0.8,
  },
  mediaLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  previewText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.sm,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
