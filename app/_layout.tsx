// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Text as RNText, TextInput as RNTextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import Backdrop from '@/components/Backdrop'; // ⬅️ add this

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
}

SplashScreen.preventAutoHideAsync();

/* === COLOR PALETTE === */
const BG = '#0B1220';
const SURFACE = '#111A2C';
const BORDER = '#1E2A44';
const TEXT = '#E6EDF3';

/* === DARK THEME FIX === */
const DarkAppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: BG,
    card: SURFACE,
    border: BORDER,
    text: TEXT,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);

  useEffect(() => {
    if (loaded) {
      try {
        ;(RNText as any).defaultProps = {
          ...(RNText as any).defaultProps,
          style: [{ fontFamily: 'JetBrainsMono-Regular' }, (RNText as any).defaultProps?.style],
        };
        ;(RNTextInput as any).defaultProps = {
          ...(RNTextInput as any).defaultProps,
          style: [{ fontFamily: 'JetBrainsMono-Regular' }, (RNTextInput as any).defaultProps?.style],
        };
      } catch (e) { console.log('apply default font failed', e); }
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkAppTheme : DefaultTheme}>
      {/* Wrapper sets the solid page bg (visible after the gradient) */}
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* 🔥 Global background (bleed + blur + fade) */}
        <Backdrop />

        <Stack
          screenOptions={{
            headerShown: false,
            // must be transparent so screens don't paint over the backdrop
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </ThemeProvider>
  )
}
