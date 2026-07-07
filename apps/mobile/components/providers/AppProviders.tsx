import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { ActivityIndicator, View, type ViewProps } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView as RNGestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const GestureHandlerRootView =
  RNGestureHandlerRootView as ComponentType<ViewProps & { children?: ReactNode }>;

import i18n, { initI18n } from "@/i18n";
import { queryClient } from "@/lib/query-client";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useLocaleStore } from "@/stores/auth-store";

function AppReady({ children }: { children: ReactNode }) {
  useAuthBootstrap();
  useProtectedRoute();
  return <>{children}</>;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const language = useLocaleStore((s) => s.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n(language).finally(() => setReady(true));
  }, [language]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color="#534AB7" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <AppReady>{children}</AppReady>
          </I18nextProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
