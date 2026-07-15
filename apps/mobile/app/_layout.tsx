import "react-native-reanimated";

import "../global.css";

import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@/components/providers/AppProviders";
import { usePushSetup } from "@/hooks/usePushSetup";

export default function RootLayout() {
  usePushSetup();

  return (
    <AppProviders>
      <Head>
        <title>בשילוב</title>
        <meta
          name="description"
          content="תמיכה, שילוב, קהילה — פלטפורמה לחיבור בין הורים לצוותים מקצועיים"
        />
      </Head>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </AppProviders>
  );
}
