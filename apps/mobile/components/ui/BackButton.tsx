import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

interface BackButtonProps {
  /** Used when the history stack is empty (e.g. deep link). */
  fallbackHref?: string;
  className?: string;
}

export function BackButton({ fallbackHref, className = "" }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  function handlePress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fallbackHref) {
      router.replace(fallbackHref as never);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      className={`self-end mb-4 active:opacity-80 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
    >
      <Text className="text-purple font-semibold font-rubik">{t("common.back")}</Text>
    </Pressable>
  );
}
