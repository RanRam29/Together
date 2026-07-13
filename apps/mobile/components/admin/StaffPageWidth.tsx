import type { ReactNode } from "react";
import { View } from "react-native";

import { AppPageWidth } from "@/components/ui/AppPageWidth";

interface StaffPageWidthProps {
  children: ReactNode;
  className?: string;
}

/** Centers staff UI on wide web viewports so controls do not stretch edge-to-edge. */
export function StaffPageWidth({ children, className = "" }: StaffPageWidthProps) {
  return <AppPageWidth className={className}>{children}</AppPageWidth>;
}
