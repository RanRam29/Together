import { Pressable, Text, View } from "react-native";

interface MetricCardProps {
  label: string;
  value: number | string;
  highlight?: "default" | "warning" | "success" | "purple";
  onPress?: () => void;
}

const HIGHLIGHT: Record<NonNullable<MetricCardProps["highlight"]>, string> = {
  default: "text-[#1c1b22]", // on-surface
  warning: "text-[#ba1a1a]", // error (Coral)
  success: "text-[#0f6e56]", // Teal
  purple: "text-[#3b309e]", // Primary
};

export function MetricCard({
  label,
  value,
  highlight = "default",
  onPress,
}: MetricCardProps) {
  const content = (
    <View className="bg-[#ffffff] border border-[#e5e1eb] rounded-[14px] p-6 shadow-sm shadow-[#3b309e]/5 flex-1 min-w-[160px] h-full">
      <Text className="text-3xl font-bold font-rubik mb-2 text-right">
        <Text className={HIGHLIGHT[highlight]}>{value}</Text>
      </Text>
      <Text className="text-sm text-[#474553] font-rubik text-right leading-5">{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80 hover:opacity-90 flex-1">
        {content}
      </Pressable>
    );
  }
  return <View className="flex-1">{content}</View>;
}
