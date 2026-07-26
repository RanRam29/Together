import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { NextActionDefinition } from "@/lib/navigation/types";
import { isAppRtl } from "@/lib/platform";
import { Button } from "@/components/ui/Button";

const ICON_MAP: Record<
  NextActionDefinition["icon"],
  keyof typeof Ionicons.glyphMap
> = {
  checkin: "location-outline",
  log: "create-outline",
  request: "mail-outline",
  publish: "sparkles-outline",
  docs: "document-text-outline",
  summary: "reader-outline",
  browse: "search-outline",
};

const VARIANT_STYLES: Record<
  NextActionDefinition["variant"],
  { bg: string; border: string; ink: string }
> = {
  purple: { bg: "bg-purple-bg", border: "border-purple", ink: "text-purple-ink" },
  teal: { bg: "bg-teal-bg", border: "border-teal", ink: "text-teal-ink" },
  amber: { bg: "bg-amber-bg", border: "border-amber", ink: "text-amber-ink" },
};

// The card tint maps to the matching solid Button fill for the CTA.
const CTA_VARIANT: Record<
  NextActionDefinition["variant"],
  "primary" | "secondary" | "warning"
> = {
  purple: "primary",
  teal: "secondary",
  amber: "warning",
};

interface NextActionCardProps {
  action: NextActionDefinition;
  onPress: () => void;
}

export function NextActionCard({ action, onPress }: NextActionCardProps) {
  const { t } = useTranslation();
  const styles = VARIANT_STYLES[action.variant];
  const chevron = isAppRtl() ? "chevron-back" : "chevron-forward";

  const title = t(action.titleKey, action.titleParams ?? {});
  const reason = t(action.reasonKey, action.reasonParams ?? {});
  const cta = t(action.ctaKey);

  return (
    <View className={`rounded-card p-5 mb-4 border ${styles.bg} ${styles.border}`}>
      <View className="flex-row items-start gap-3 mb-3">
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-border">
          <Ionicons name={ICON_MAP[action.icon]} size={22} color="#534AB7" />
        </View>
        <View className="flex-1">
          <Text
            className={`text-xs font-bold uppercase tracking-widest mb-1 font-rubik text-start ${styles.ink}`}
          >
            {t("nba.eyebrow")}
          </Text>
          <Text className="text-lg font-bold text-ink font-rubik text-start leading-6">
            {title}
          </Text>
          <Text className="text-sm text-ink-2 mt-1 leading-5 text-start">{reason}</Text>
        </View>
      </View>
      <Button
        variant={CTA_VARIANT[action.variant]}
        label={cta}
        icon={<Ionicons name={chevron} size={18} color="#FFFFFF" />}
        iconPosition="trailing"
        onPress={onPress}
        className="rounded-full"
      />
    </View>
  );
}
