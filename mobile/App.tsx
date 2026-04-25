import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/auth.store';
import { useOfflineSync } from './src/hooks/useOfflineSync';

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  useOfflineSync();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
