import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";

import { AppSwitch } from "@/components/ui/AppSwitch";
import { ScreenShell } from "@/components/ui/Screen";
import { LanguageToggle } from "@/components/ui/Form";
import { changeAppLanguage } from "@/i18n";
import { useAuthStore, useLocaleStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { getStoredPushToken, removePushToken } from "@/lib/push-notifications";
import { useNotificationPrefs, useUpdateNotificationPrefs } from "@/hooks/useSettings";
import {
  isSmartLandingEnabled,
  setSmartLandingEnabled,
} from "@/lib/navigation/landing-prefs";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const reset = useAuthStore((s) => s.reset);
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  const userId = session?.user?.id;

  const { data: prefs, isLoading } = useNotificationPrefs(userId);
  const updatePrefs = useUpdateNotificationPrefs(userId);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const [smartLanding, setSmartLanding] = useState(true);
  const [landingPrefLoading, setLandingPrefLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void isSmartLandingEnabled().then((enabled) => {
      if (active) {
        setSmartLanding(enabled);
        setLandingPrefLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function toggleSmartLanding(value: boolean) {
    setSmartLanding(value);
    await setSmartLandingEnabled(value);
  }

  async function executeLogout() {
    const token = getStoredPushToken();
    if (userId && token) {
      await removePushToken(userId, token);
    }

    await supabase.auth.signOut();
    reset();
    router.replace("/");
  }

  async function handleLogout() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(t("settings.logoutConfirm"));
      if (confirmed) {
        await executeLogout();
      }
      return;
    }

    Alert.alert(t("settings.logoutTitle"), t("settings.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("settings.logoutAction"),
        style: "destructive",
        onPress: executeLogout,
      },
    ]);
  }

  function togglePref(key: "checkin" | "daily_summary", value: boolean) {
    updatePrefs.mutate({ [key]: value });
  }

  const profile = useAuthStore((s) => s.profile);
  const backFallback =
    profile?.role === "professional" ? "/(professional)" : "/(parent)/(tabs)";

  return (
    <ScreenShell title={t("settings.title")} showBack backFallbackHref={backFallback}>
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="bg-surface rounded-card border border-border p-4 mb-6">
          <LanguageToggle
            language={language}
            label={t("settings.languageLabel")}
            onToggle={async () => {
              const next = language === "he" ? "en" : "he";
              setLanguage(next);
              await changeAppLanguage(next);
            }}
          />
        </View>

        <View className="bg-surface rounded-card border border-border p-4 mb-6">
          <Text className="text-lg font-bold text-ink mb-4 font-rubik text-start">
            {t("settings.pushTitle")}
          </Text>

          {isLoading ? (
            <ActivityIndicator size="small" color="#534AB7" />
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-4 border-b border-border/50 pb-4">
                <AppSwitch
                  value={prefs?.checkin ?? true}
                  onValueChange={(val) => togglePref("checkin", val)}
                />
                <View className="flex-1 ms-3">
                  <Text className="text-base font-semibold text-ink text-start">
                    {t("settings.checkinLabel")}
                  </Text>
                  <Text className="text-sm text-ink-2 text-start">
                    {t("settings.checkinDesc")}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <AppSwitch
                  value={prefs?.daily_summary ?? true}
                  onValueChange={(val) => togglePref("daily_summary", val)}
                />
                <View className="flex-1 ms-3">
                  <Text className="text-base font-semibold text-ink text-start">
                    {t("settings.dailySummaryLabel")}
                  </Text>
                  <Text className="text-sm text-ink-2 text-start">
                    {t("settings.dailySummaryDesc")}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View className="bg-surface rounded-card border border-border p-4 mb-6">
          <Text className="text-lg font-bold text-ink mb-4 font-rubik text-start">
            {t("settings.navigationTitle")}
          </Text>
          {landingPrefLoading ? (
            <ActivityIndicator size="small" color="#534AB7" />
          ) : (
            <View className="flex-row items-center justify-between">
              <AppSwitch
                value={smartLanding}
                onValueChange={toggleSmartLanding}
              />
              <View className="flex-1 ms-3">
                <Text className="text-base font-semibold text-ink text-start">
                  {t("settings.smartLandingLabel")}
                </Text>
                <Text className="text-sm text-ink-2 text-start">
                  {t("settings.smartLandingDesc")}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="bg-surface rounded-card border border-border p-4 mb-6">
          <Text className="text-lg font-bold text-ink mb-4 font-rubik text-start">
            {t("guide.howToTitle")}
          </Text>
          <Pressable
            onPress={() => router.push("/how-to-use" as never)}
            className="py-3 flex-row-reverse items-center justify-between"
          >
            <Text className="text-base text-purple text-start font-rubik">
              {t("guide.openGuide")}
            </Text>
            <Ionicons name="help-circle-outline" size={20} color="#534AB7" />
          </Pressable>
        </View>

        <View className="bg-surface rounded-card border border-border p-4 mb-6">
          <Text className="text-lg font-bold text-ink mb-4 font-rubik text-start">
            {t("settings.legalTitle")}
          </Text>
          <Pressable
            onPress={() => router.push("/legal/privacy" as never)}
            className="py-3 border-b border-border/50"
          >
            <Text className="text-base text-purple text-start font-rubik">
              {t("legal.privacyTitle")}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push("/legal/terms" as never)} className="py-3">
            <Text className="text-base text-purple text-start font-rubik">
              {t("legal.termsTitle")}
            </Text>
          </Pressable>
        </View>

        <Text className="text-xs text-ink-2 text-center mb-4">
          {t("settings.version", { version: appVersion })}
        </Text>

        <Pressable
          onPress={handleLogout}
          className="bg-coral/10 p-4 rounded-xl flex-row items-center justify-center gap-2 mt-4"
        >
          <Ionicons name="log-out-outline" size={20} color="#E04D40" />
          <Text className="text-coral font-bold text-base">{t("settings.logoutAction")}</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}
