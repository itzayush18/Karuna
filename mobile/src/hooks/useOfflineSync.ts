import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { useOfflineStore } from '../store/offline.store';

export function useOfflineSync() {
  const hydrate = useOfflineStore((state) => state.hydrate);
  const sync = useOfflineStore((state) => state.sync);

  useEffect(() => {
    void hydrate();
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void sync();
    });
    return unsubscribe;
  }, [hydrate, sync]);
}
