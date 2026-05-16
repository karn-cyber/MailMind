import React, {useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { API_BASE_URL } from './src/constants/config';

export default function App() {
  useEffect(() => {
    // Debug: surface the resolved API base so we can confirm networking
    // when testing on device / emulator.
    // Metro logs will show this value on app start.
    // Remove this after verification.
    // eslint-disable-next-line no-console
    console.log('Resolved API_BASE_URL:', API_BASE_URL);
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
