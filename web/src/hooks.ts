import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { getAuthState, subscribeAuth } from './store/auth';

/* ---- useAuth: subscribe to auth store ---- */
export function useAuth() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);
}

/* ---- useAsync: fetch data with loading/error states ---- */
export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

/* ---- Helpers ---- */
export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    FOOD: 'warning',
    WATER: 'ocean',
    MEDICAL: 'danger',
    SHELTER: 'primary',
    SANITATION: 'success',
    EDUCATION: 'primary',
    TRANSPORT: 'ocean',
    OTHER: 'neutral',
  };
  return map[cat] ?? 'neutral';
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    OPEN: 'warning',
    ASSIGNED: 'primary',
    IN_PROGRESS: 'ocean',
    COMPLETED: 'success',
    CANCELLED: 'neutral',
    PROPOSED: 'warning',
    APPROVED: 'primary',
    OVERRIDDEN: 'danger',
  };
  return map[status] ?? 'neutral';
}
