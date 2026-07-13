import type { ReactNode } from "react";
import { View } from "react-native";

interface AppPageWidthProps {
  children: ReactNode;
  className?: string;
}

/** Keeps app content readable on wide web viewports. */
export function AppPageWidth({ children, className = "" }: AppPageWidthProps) {
  return (
    <View className={`w-full max-w-2xl mx-auto ${className}`}>{children}</View>
  );
}
