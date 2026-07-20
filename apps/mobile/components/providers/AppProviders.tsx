import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Platform, View, type ViewProps } from "react-native";
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

// Web font fix: on Vercel the bundled font files live under `/assets/__node_modules/…`,
// and Vercel returns 403 for any path containing `node_modules`, so Rubik + the Material
// icon font fail to load and all text falls back to a system font (the app "loses its
// design"). We load Rubik (Hebrew + Latin subsets) and Material Icons from the Google
// Fonts CDN and override the `.font-rubik*` utilities with uniquely-named web families,
// injected at runtime so this wins regardless of how the app's own broken @font-face
// (Rubik_400Regular…) is ordered. Web only; no-op on native.
const WEB_FONT_FIX = `
@font-face{font-family:'RubikWeb';font-weight:400;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nDrXyi0A.woff2') format('woff2');unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F;}
@font-face{font-family:'RubikWeb';font-weight:400;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nBrXw.woff2') format('woff2');}
@font-face{font-family:'RubikWebMedium';font-weight:500;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nDrXyi0A.woff2') format('woff2');unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F;}
@font-face{font-family:'RubikWebMedium';font-weight:500;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nBrXw.woff2') format('woff2');}
@font-face{font-family:'RubikWebBold';font-weight:700;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nDrXyi0A.woff2') format('woff2');unicode-range:U+0590-05FF,U+200C-2010,U+20AA,U+25CC,U+FB1D-FB4F;}
@font-face{font-family:'RubikWebBold';font-weight:700;font-display:swap;src:url('https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nBrXw.woff2') format('woff2');}
@font-face{font-family:'material';font-weight:400;font-display:block;src:url('https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2') format('woff2');}
@font-face{font-family:'MaterialIcons';font-weight:400;font-display:block;src:url('https://fonts.gstatic.com/s/materialicons/v145/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2') format('woff2');}
.font-rubik{font-family:'RubikWeb',sans-serif !important;}
.font-rubik-medium{font-family:'RubikWebMedium','RubikWeb',sans-serif !important;}
.font-rubik-bold{font-family:'RubikWebBold','RubikWeb',sans-serif !important;}
`;

function injectWebFonts() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  if (document.getElementById("together-web-fonts")) return;
  const style = document.createElement("style");
  style.id = "together-web-fonts";
  style.textContent = WEB_FONT_FIX;
  document.head.appendChild(style);
}
injectWebFonts();

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
