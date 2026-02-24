import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ title: 'Login', headerShown: false }} />
              <Stack.Screen name="(auth)/register" options={{ title: 'Register', headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ title: 'Onboarding', headerShown: false }} />
              <Stack.Screen name="verify-nfc" options={{ title: 'Verify NFC' }} />
              <Stack.Screen name="transaction" options={{ title: 'Transaction' }} />
              <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
              <Stack.Screen name="create-wallet" options={{ title: 'Create Wallet' }} />
              <Stack.Screen name="product/[id]" options={{ title: 'Product Details' }} />
              <Stack.Screen name="order/all-products" options={{ title: 'All Products' }} />
              <Stack.Screen name="order/[id]" options={{ title: 'Order Details' }} />
              <Stack.Screen name="order/track" options={{ title: 'Track Order' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </SafeAreaView>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
