import { Modal, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { celebrateEntering } from "@/lib/motion";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface SentConfirmationOverlayProps {
  visible: boolean;
  title: string;
  description: string;
  footnote?: string;
  icon?: IoniconName;
  iconColor?: string;
  iconBgClass?: string;
}

export function SentConfirmationOverlay({
  visible,
  title,
  description,
  footnote,
  icon = "mail",
  iconColor = "#534AB7",
  iconBgClass = "bg-purple-bg",
}: SentConfirmationOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/45 items-center justify-center px-8">
        <AnimatedEntrance
          entering={celebrateEntering()}
          className="bg-surface rounded-card border border-border p-8 items-center w-full max-w-sm"
        >
          <View
            className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${iconBgClass}`}
          >
            <Ionicons name={icon} size={42} color={iconColor} />
          </View>
          <Text className="text-xl font-bold text-ink font-rubik text-center mb-2">
            {title}
          </Text>
          <Text className="text-sm text-ink-2 text-center leading-6">{description}</Text>
          {footnote ? (
            <Text className="text-xs text-purple font-medium font-rubik text-center mt-4">
              {footnote}
            </Text>
          ) : null}
        </AnimatedEntrance>
      </View>
    </Modal>
  );
}
