import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
} from "@expo-google-fonts/rubik";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView as RNGestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import i18n, { initI18n } from "@/i18n";
import { isSupabaseConfigured } from "@/lib/supabase";
import { queryClient } from "@/lib/query-client";
import { ConfigErrorScreen } from "@/components/shared/ConfigErrorScreen";
import { SplashReveal } from "@/components/motion/SplashReveal";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { usePushSetup } from "@/hooks/usePushSetup";
import { PushPermissionProvider } from "@/components/shared/PushPermissionProvider";
import { UsageGuideGate } from "@/components/guide/UsageGuideGate";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ActionFeedbackHost } from "@/components/shared/ActionFeedbackHost";
import { bindReduceMotionListener } from "@/lib/motion";
import { useLocaleStore } from "@/stores/auth-store";

const GestureHandlerRootView =
  RNGestureHandlerRootView as ComponentType<ViewProps & { children?: ReactNode }>;

// Keep the native splash (app.json's expo-splash-screen config — same logo/bg as
// SplashReveal, so the handoff below is invisible) up until SplashReveal has mounted
// and can take over the reveal animation with zero gap.
void SplashScreen.preventAutoHideAsync();

function AppReady({ children }: { children: ReactNode }) {
  useAuthBootstrap();
  useProtectedRoute();
  usePushSetup();
  return (
    <>
      {children}
      <PushPermissionProvider />
      <UsageGuideGate />
    </>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  const language = useLocaleStore((s) => s.language);
  const [i18nReady, setI18nReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  useEffect(() => {
    initI18n(language).finally(() => setI18nReady(true));
  }, [language]);

  // Safety net: never block rendering forever if fonts fail to load (common on web) —
  // fall back to the system font after a short timeout instead of a perpetual splash.
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => bindReduceMotionListener(), []);

  // Hand off from the native splash to SplashReveal the moment we can paint —
  // same logo/background on both, so the swap doesn't flash.
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  const fontsSettled = fontsLoaded || !!fontError || timedOut;

  if (!fontsSettled || !i18nReady) {
    return <SplashReveal />;
  }

  // Missing/invalid backend config would otherwise leave the app pointed at an
  // inert placeholder (silent failure) — surface it explicitly instead.
  if (!isSupabaseConfigured) {
    return <ConfigErrorScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <View style={{ flex: 1 }}>
              <OfflineBanner />
              <View style={{ flex: 1 }}>
                <AppReady>{children}</AppReady>
              </View>
              <ActionFeedbackHost />
            </View>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
