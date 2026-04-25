import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { backend } from '../services/backend';
import { OfflineReportPayload } from '../types/api';

const QUEUE_KEY = 'smart-resource-offline-report-queue';

type OfflineState = {
  queue: OfflineReportPayload[];
  syncing: boolean;
  hydrate: () => Promise<void>;
  enqueueReport: (payload: Omit<OfflineReportPayload, 'id' | 'createdAt' | 'status'>) => Promise<OfflineReportPayload>;
  sync: () => Promise<void>;
};

async function persist(queue: OfflineReportPayload[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  queue: [],
  syncing: false,
  async hydrate() {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    set({ queue: raw ? JSON.parse(raw) : [] });
  },
  async enqueueReport(payload) {
    const queued: OfflineReportPayload = {
      ...payload,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const queue = [...get().queue, queued];
    set({ queue });
    await persist(queue);
    return queued;
  },
  async sync() {
    const pending = get().queue.filter((item) => item.status !== 'uploaded');
    if (!pending.length || get().syncing) return;
    set({ syncing: true });
    const nextQueue = [...get().queue];
    for (const report of pending) {
      try {
        await backend.submitReport({
          source: 'SYNC',
          rawText: report.rawText,
          formData: report.formData,
          idempotencyKey: report.idempotencyKey,
          clientRecordId: report.id,
        });
        const index = nextQueue.findIndex((item) => item.id === report.id);
        if (index >= 0) nextQueue[index] = { ...nextQueue[index], status: 'uploaded' };
      } catch {
        const index = nextQueue.findIndex((item) => item.id === report.id);
        if (index >= 0) nextQueue[index] = { ...nextQueue[index], status: 'failed' };
      }
    }
    const compacted = nextQueue.filter((item) => item.status !== 'uploaded');
    set({ queue: compacted, syncing: false });
    await persist(compacted);
  },
}));
