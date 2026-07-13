import { useTranslation } from "react-i18next";
import { ScrollView, Text } from "react-native";

import { ScreenShell } from "@/components/ui/Screen";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("legal.privacyTitle")} showBack>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="text-sm text-ink-2 leading-6 text-right mb-4">
          {t("legal.privacyBeta")}
        </Text>
        <Text className="text-sm text-ink leading-6 text-right mb-4">
          {t("legal.privacyBody")}
        </Text>
        <Text className="text-xs text-ink-2 text-right">{t("legal.contact")}</Text>
      </ScrollView>
    </ScreenShell>
  );
}
