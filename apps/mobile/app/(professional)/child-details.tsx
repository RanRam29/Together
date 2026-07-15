import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { ScreenShell } from "@/components/ui/Screen";
import { useChildDetailsProfessional } from "@/hooks/useMatchPermissions";
import { useScreenshotProtection } from "@/hooks/useScreenshotProtection";
import { BrandSpinner } from "@/components/motion/BrandSpinner";

export default function ChildDetailsProfessionalScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ childId?: string }>();
  const childId = params.childId ?? "";

  useScreenshotProtection(childId);

  const { data: details, isLoading } = useChildDetailsProfessional(childId);

  if (isLoading) {
    return (
      <ScreenShell title={t("professional.childDetailsTitle", "תיק הילד")} showBack>
        <BrandSpinner size="large" />
      </ScreenShell>
    );
  }

  if (!details) {
    return (
      <ScreenShell title={t("professional.childDetailsTitle", "תיק הילד")} showBack>
        <Text className="text-center mt-8 text-ink-2">
          {t("common.noData", "לא נמצאו נתונים")}
        </Text>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      title={t("professional.childDetailsTitle", "תיק הילד")}
      showBack
      backFallbackHref="/(professional)/today"
    >
      <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
        <View className="bg-surface border border-border rounded-card p-4 mb-6">
          {details.full_name && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.full_name", "שם מלא")}
              </Text>
              <Text className="text-base text-ink font-medium text-start">
                {details.full_name}
              </Text>
            </View>
          )}

          {details.diagnosis_full && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.diagnosis_full", "אבחנה מלאה")}
              </Text>
              <Text className="text-base text-ink text-start">
                {details.diagnosis_full}
              </Text>
            </View>
          )}

          {details.what_works && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.what_works", "מה עובד")}
              </Text>
              <Text className="text-base text-ink text-start">
                {details.what_works}
              </Text>
            </View>
          )}

          {details.what_triggers && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.what_triggers", "טריגרים")}
              </Text>
              <Text className="text-base text-ink text-start">
                {details.what_triggers}
              </Text>
            </View>
          )}



          {details.win_definition && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.win_definition", "מה ייחשב הצלחה")}
              </Text>
              <Text className="text-base text-ink text-start">
                {details.win_definition}
              </Text>
            </View>
          )}

          {details.notes && (
            <View className="mb-4">
              <Text className="text-xs font-bold text-teal mb-1 text-start">
                {t("permissions.fields.notes", "הערות נוספות")}
              </Text>
              <Text className="text-base text-ink text-start">
                {details.notes}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
