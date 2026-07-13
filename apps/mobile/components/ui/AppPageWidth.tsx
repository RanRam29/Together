import type { ReactNode } from "react";
import { Platform, View } from "react-native";

interface AppPageWidthProps {
  children: ReactNode;
  className?: string;
}

/** Responsive content width: wider on web, full width on native. */
export function AppPageWidth({ children, className = "" }: AppPageWidthProps) {
  const widthClass =
    Platform.OS === "web" ? "w-full max-w-5xl mx-auto" : "w-full";
  return <View className={`${widthClass} ${className}`}>{children}</View>;
}
