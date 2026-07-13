import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export interface GuideStep {
  icon: IoniconName;
  /** i18n key under guide.<role>.steps.<index> — resolves .title and .body */
  key: string;
}

/**
 * Role → ordered guide steps. Titles/bodies live in i18n under
 * `guide.<role>.steps.<n>.{title,body}` so they stay translatable (he/en).
 */
export const GUIDE_STEPS: Record<string, GuideStep[]> = {
  parent: [
    { icon: "home", key: "0" },
    { icon: "person-add", key: "1" },
    { icon: "heart", key: "2" },
    { icon: "calendar", key: "3" },
  ],
  professional: [
    { icon: "home", key: "0" },
    { icon: "document-text", key: "1" },
    { icon: "search", key: "2" },
    { icon: "location", key: "3" },
  ],
  admin: [
    { icon: "grid", key: "0" },
    { icon: "people", key: "1" },
    { icon: "stats-chart", key: "2" },
  ],
  supervisor: [
    { icon: "shield-checkmark", key: "0" },
    { icon: "document-text", key: "1" },
    { icon: "checkmark-done", key: "2" },
  ],
};

/** Roles that have a guide. Others fall back to the parent guide. */
export function guideRole(role: string | null | undefined): string {
  if (role && GUIDE_STEPS[role]) return role;
  return "parent";
}
