import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { ComposeScreen } from '../screens/ComposeScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { state, isInitialised } = useApp();

  if (!isInitialised) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  const initialRoute: keyof RootStackParamList = state.apiKey ? 'Home' : 'Settings';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Summary" component={SummaryScreen} />
        <Stack.Screen name="Compose" component={ComposeScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          initialParams={{ fromOnboarding: !state.apiKey }}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});
