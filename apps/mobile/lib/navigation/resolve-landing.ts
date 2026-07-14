import type { JourneyStage, NextActionContext } from "./types";

const PRO_DAILY_OPS_STAGES = new Set<JourneyStage>([
  "daily_ops_morning",
  "daily_ops_active",
  "daily_ops_log",
]);

const PARENT_REQUEST_STAGES = new Set<JourneyStage>([
  "request_needs_approval",
  "awaiting_request_response",
]);

export function resolveLandingRoute(
  ctx: NextActionContext,
  stage: JourneyStage,
): string | null {
  if (ctx.role === "professional" && PRO_DAILY_OPS_STAGES.has(stage)) {
    return "/(professional)/today";
  }

  if (ctx.role === "parent" && PARENT_REQUEST_STAGES.has(stage)) {
    return "/(parent)/(tabs)/requests";
  }

  return null;
}

export function landingStorageKey(userId: string, dateIso: string) {
  return `landing_resolved_${userId}_${dateIso}`;
}
