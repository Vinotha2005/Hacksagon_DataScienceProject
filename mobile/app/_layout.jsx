import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import useAuth from '../hooks/useAuth';
import { theme } from '../constants/theme';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const { checkSession } = useAuth();

  useEffect(() => {
    checkSession().then((user) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
        initialRouteName={isLoggedIn ? '(tabs)' : 'login'}
      >
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <Toast />
    </>
  );
}
