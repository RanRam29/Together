import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { PrimaryButton, RoleCard, ScreenShell } from "@/components/ui/Screen";
import type { UserRole } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";

export default function RoleSelectScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setProfile = useAuthStore((s) => s.setProfile);
  const profile = useAuthStore((s) => s.profile);

  function selectRole(role: UserRole) {
    if (!profile) {
      router.push("/(auth)/onboarding");
      return;
    }

    setProfile({ ...profile, role });
    router.replace(role === "parent" ? "/(parent)" : "/(professional)");
  }

  return (
    <ScreenShell title={t("auth.roleSelectTitle")}>
      <RoleCard
        title={t("auth.roleParent")}
        description={t("auth.roleParentDesc")}
        onPress={() => selectRole("parent")}
      />
      <RoleCard
        title={t("auth.roleProfessional")}
        description={t("auth.roleProfessionalDesc")}
        onPress={() => selectRole("professional")}
      />
      <View className="mt-4">
        <PrimaryButton
          label={t("common.continue")}
          variant="teal"
          onPress={() => router.push("/(auth)/onboarding")}
        />
      </View>
    </ScreenShell>
  );
}
