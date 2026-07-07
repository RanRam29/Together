import { useTranslation } from "react-i18next";
import { Alert, TextInput, View } from "react-native";

import {
  LanguageToggle,
  PrimaryButton,
  ScreenShell,
} from "@/components/ui/Screen";
import { changeAppLanguage } from "@/i18n";
import { useLocaleStore } from "@/stores/auth-store";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLocaleStore();

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

  return (
    <ScreenShell
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <View className="pb-10">
          <PrimaryButton label={t("auth.sendOtp")} />
        </View>
      }
    >
      <LanguageToggle
        language={language}
        label={t("common.language")}
        onToggle={toggleLanguage}
      />
      <TextInput
        placeholder={t("auth.phonePlaceholder")}
        keyboardType="phone-pad"
        className="bg-surface border border-border rounded-card px-4 py-4 text-ink text-base"
        placeholderTextColor="#918D84"
      />
    </ScreenShell>
  );
}
