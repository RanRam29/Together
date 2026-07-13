import type { TFunction } from "i18next";

import { NEED_CATEGORIES } from "@/lib/constants/child";

/** Replace raw need_category enum keys inside DB match_reason with localized labels. */
export function formatMatchReason(matchReason: string, t: TFunction): string {
  let formatted = matchReason;
  for (const category of NEED_CATEGORIES) {
    const label = t(`enums.needCategory.${category}`);
    formatted = formatted.replaceAll(category, label);
  }
  return formatted;
}
