import { Pressable, View } from "react-native";

import { webPressableClass } from "@/lib/platform";

interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

/** Custom toggle — avoids native Switch RTL overflow glitches on web. */
export function AppSwitch({ value, onValueChange, disabled }: AppSwitchProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      className={`w-12 h-7 rounded-full justify-center px-1 shrink-0 ${webPressableClass} ${
        value ? "bg-purple" : "bg-border"
      } ${disabled ? "opacity-50" : "active:opacity-90"}`}
    >
      <View
        className={`w-5 h-5 rounded-full bg-white ${value ? "self-end" : "self-start"}`}
      />
    </Pressable>
  );
}
