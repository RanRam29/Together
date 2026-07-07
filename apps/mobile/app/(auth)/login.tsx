import { useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, Text, View } from "react-native";

import {
  LanguageToggle,
  PrimaryButton,
  ScreenShell,
  TextField,
} from "@/components/ui/Screen";
import { sendPhoneOtp } from "@/lib/auth-api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isValidIsraeliPhone } from "@/lib/phone";
import { changeAppLanguage } from "@/i18n";
import { useLocaleStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useLocaleStore();
  const { selectedRole, pendingPhone, setPendingPhone } = useOnboardingStore();
  const [phone, setPhone] = useState(pendingPhone);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function toggleLanguage() {
    const next = language === "he" ? "en" : "he";
    setLanguage(next);
    const needsReload = await changeAppLanguage(next);
    if (needsReload) {
      Alert.alert(
        t("common.language"),
        language === "he"
          ? "Restart the app to apply layout direction."
          : "הפעילו מחדש את האפליקציה כדי להחיל כיוון תצוגה."
      );
    }
  }

  async function handleSendOtp() {
    if (!selectedRole) {
      router.replace("/(auth)/role-select");
      return;
    }

    if (!isValidIsraeliPhone(phone)) {
      setError(t("auth.invalidPhone"));
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(t("common.error"), t("auth.supabaseMissing"));
      return;
    }

    setError(undefined);
    setLoading(true);

    try {
      await sendPhoneOtp(phone, selectedRole);
      setPendingPhone(phone);
      router.push("/(auth)/verify-otp");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("auth.authFailed");
      Alert.alert(t("common.error"), message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenShell
      eyebrow={t("auth.loginEyebrow")}
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <View className="pb-10">
          <PrimaryButton
            label={t("auth.sendOtp")}
            onPress={handleSendOtp}
            loading={loading}
          />
        </View>
      }
    >
      <LanguageToggle
        language={language}
        label={t("common.language")}
        onToggle={toggleLanguage}
      />

      <Pressable onPress={() => router.replace("/(auth)/role-select")} className="mb-6">
        <Text className="text-sm text-purple font-medium font-rubik">
          {selectedRole === "parent"
            ? t("auth.roleParent")
            : selectedRole === "professional"
              ? t("auth.roleProfessional")
              : t("auth.roleSelectTitle")}{" "}
          · {t("common.back")}
        </Text>
      </Pressable>

      <TextField
        label={t("auth.phoneLabel")}
        placeholder={t("auth.phonePlaceholder")}
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={error}
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
    </ScreenShell>
  );
}
