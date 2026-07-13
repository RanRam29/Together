import type { ReactNode } from "react";
import { View } from "react-native";

interface StaffPageWidthProps {
  children: ReactNode;
  className?: string;
}

/** Centers staff UI on wide web viewports so controls do not stretch edge-to-edge. */
export function StaffPageWidth({ children, className = "" }: StaffPageWidthProps) {
  return (
    <View className={`w-full max-w-2xl mx-auto ${className}`}>{children}</View>
  );
}
