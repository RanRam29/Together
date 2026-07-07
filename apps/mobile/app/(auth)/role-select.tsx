import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";

import {
  LanguageToggle,
  PrimaryButton,
  RoleCard,
  ScreenShell,
} from "@/components/ui/Screen";
import { changeAppLanguage } from "@/i18n";
import type { UserRole } from "@/lib/types";
import { useLocaleStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, setLanguage } = useLocaleStore();
  const { selectedRole, setSelectedRole } = useOnboardingStore();

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

  function pickRole(role: UserRole) {
    setSelectedRole(role);
  }

  function continueToLogin() {
    if (!selectedRole) return;
    router.push("/(auth)/login");
  }

  return (
    <ScreenShell
      eyebrow={t("auth.roleSelectEyebrow")}
      title={t("auth.roleSelectTitle")}
      subtitle={t("auth.roleSelectSubtitle")}
      footer={
        <View className="pb-10">
          <PrimaryButton
            label={t("common.continue")}
            onPress={continueToLogin}
            disabled={!selectedRole}
          />
        </View>
      }
    >
      <LanguageToggle
        language={language}
        label={t("common.language")}
        onToggle={toggleLanguage}
      />

      <RoleCard
        title={t("auth.roleParent")}
        description={t("auth.roleParentDesc")}
        selected={selectedRole === "parent"}
        onPress={() => pickRole("parent")}
      />
      <RoleCard
        title={t("auth.roleProfessional")}
        description={t("auth.roleProfessionalDesc")}
        selected={selectedRole === "professional"}
        onPress={() => pickRole("professional")}
      />
    </ScreenShell>
  );
}
