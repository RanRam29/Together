import type { TFunction } from "i18next";

import { FRAMEWORK_TYPES, NEED_CATEGORIES } from "@/lib/constants/child";

function replaceEnumTokens(
  text: string,
  keys: readonly string[],
  labelFor: (key: string) => string,
): string {
  let formatted = text;
  for (const key of keys) {
    formatted = formatted.replaceAll(key, labelFor(key));
  }
  return formatted;
}

/** Replace raw DB enum keys inside match_reason with localized labels. */
export function formatMatchReason(matchReason: string, t: TFunction): string {
  let formatted = matchReason;
  formatted = replaceEnumTokens(formatted, NEED_CATEGORIES, (key) =>
    t(`enums.needCategory.${key}`),
  );
  formatted = replaceEnumTokens(formatted, FRAMEWORK_TYPES, (key) =>
    t(`enums.frameworkType.${key}`),
  );
  return formatted;
}
