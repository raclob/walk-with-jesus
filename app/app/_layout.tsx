import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { CormorantGaramond_400Regular } from "@expo-google-fonts/cormorant-garamond/400Regular";
import { CormorantGaramond_400Regular_Italic } from "@expo-google-fonts/cormorant-garamond/400Regular_Italic";
import { CormorantGaramond_500Medium } from "@expo-google-fonts/cormorant-garamond/500Medium";
import { useFonts as useInterFonts, useFonts as useCormorantFonts } from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BootScreen } from "@/components/BootScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { SermonProvider } from "@/contexts/SermonContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

const MIN_BOOT_MS = 3000;
const queryClient = new QueryClient();

function RootLayoutNav() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.foreground,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        contentStyle: { backgroundColor: c.background },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="chapter/[bookId]/[chapter]" options={{ title: "" }} />
      <Stack.Screen name="milestone/[bookId]" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="prestige" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="sermon/[id]" options={{ title: "" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [cormorantLoaded, cormorantError] = useCormorantFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
  });

  const fontsReady = (interLoaded || !!interError) && (cormorantLoaded || !!cormorantError);

  const startTime = useRef(Date.now());
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [bootHidden, setBootHidden] = useState(false);

  useEffect(() => {
    const elapsed = Date.now() - startTime.current;
    const remaining = Math.max(0, MIN_BOOT_MS - elapsed);
    const t = setTimeout(() => setMinTimePassed(true), remaining);
    return () => clearTimeout(t);
  }, []);

  const bootReady = fontsReady && minTimePassed;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  const handleBootHidden = useCallback(() => setBootHidden(true), []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <SettingsProvider>
                <ProgressProvider>
                  <TranslationProvider>
                    <SermonProvider>
                      <StatusBar style="light" />
                      <RootLayoutNav />
                      {!bootHidden && (
                        <BootScreen ready={bootReady} onHidden={handleBootHidden} fontsReady={fontsReady} />
                      )}
                    </SermonProvider>
                  </TranslationProvider>
                </ProgressProvider>
              </SettingsProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
