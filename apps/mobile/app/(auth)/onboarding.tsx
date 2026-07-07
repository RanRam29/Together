import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PlaceholderCard, PrimaryButton, ScreenShell } from "@/components/ui/Screen";

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScreenShell
      title={t("auth.onboardingTitle")}
      subtitle={t("auth.onboardingSubtitle")}
      footer={
        <View className="pb-10">
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => router.replace("/(auth)/role-select")}
          />
        </View>
      }
    >
      <PlaceholderCard text="Onboarding forms — week 2–3" />
    </ScreenShell>
  );
}
