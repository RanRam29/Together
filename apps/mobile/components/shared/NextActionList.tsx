import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { NextActionDefinition } from "@/lib/navigation/types";
import { isAppRtl, webPressableClass } from "@/lib/platform";

interface NextActionListProps {
  actions: NextActionDefinition[];
  onPress: (action: NextActionDefinition) => void;
}

export function NextActionList({ actions, onPress }: NextActionListProps) {
  const { t } = useTranslation();
  const chevron = isAppRtl() ? "chevron-back" : "chevron-forward";

  if (actions.length === 0) return null;

  return (
    <View className="mb-4 rounded-card border border-border bg-surface overflow-hidden">
      <Text className="text-xs font-bold uppercase tracking-widest text-ink-2 px-4 pt-3 pb-1 font-rubik text-start">
        {t("nba.secondaryEyebrow")}
      </Text>
      {actions.map((action, index) => (
        <Pressable
          key={action.id}
          onPress={() => onPress(action)}
          className={`flex-row items-center justify-between px-4 py-3 active:bg-surface-2 ${index < actions.length - 1 ? "border-b border-border/60" : ""} ${webPressableClass}`}
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-ink font-rubik text-start flex-1">
            {t(action.titleKey, action.titleParams ?? {})}
          </Text>
          <Ionicons name={chevron} size={16} color="#6B6B6B" />
        </Pressable>
      ))}
    </View>
  );
}
