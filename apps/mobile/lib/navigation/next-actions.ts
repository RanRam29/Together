import type { NextActionContext, NextActionDefinition } from "./types";

export function getNextActions(ctx: NextActionContext): NextActionDefinition[] {
  if (ctx.role === "professional") {
    return getProfessionalActions(ctx);
  }
  return getParentActions(ctx);
}

export function getPrimaryNextAction(
  ctx: NextActionContext,
): NextActionDefinition | null {
  const actions = getNextActions(ctx);
  return actions[0] ?? null;
}

export function getSecondaryNextActions(
  ctx: NextActionContext,
  limit = 2,
): NextActionDefinition[] {
  return getNextActions(ctx).slice(1, 1 + limit);
}

export function deriveJourneyStage(ctx: NextActionContext): NextActionDefinition["stage"] {
  return getPrimaryNextAction(ctx)?.stage ?? "no_active_match";
}

function getProfessionalActions(ctx: NextActionContext): NextActionDefinition[] {
  const actions: NextActionDefinition[] = [];

  if (!ctx.verified) {
    actions.push({
      id: "pro_verify_docs",
      priority: 1,
      stage: "awaiting_verification",
      href: "/(professional)/documents",
      variant: "amber",
      icon: "docs",
      titleKey: "nba.proVerify.title",
      reasonKey: "nba.proVerify.reason",
      ctaKey: "nba.proVerify.cta",
    });
    return actions.sort((a, b) => a.priority - b.priority);
  }

  if (ctx.pendingRequestId) {
    actions.push({
      id: "pro_pending_request",
      priority: 2,
      stage: "pro_pending_requests",
      href: "/(professional)/request-detail",
      params: { requestId: ctx.pendingRequestId },
      variant: "purple",
      icon: "request",
      titleKey: "nba.proPendingRequest.title",
      reasonKey: "nba.proPendingRequest.reason",
      ctaKey: "nba.proPendingRequest.cta",
      badgeKey: "pro_requests",
    });
  }

  if (ctx.activeMatchId) {
    if (!ctx.hasCheckedInToday && !ctx.isAfternoon) {
      actions.push({
        id: "pro_checkin",
        priority: 3,
        stage: "daily_ops_morning",
        href: "/(professional)/today",
        variant: "teal",
        icon: "checkin",
        titleKey: "nba.proCheckin.title",
        reasonKey: "nba.proCheckin.reason",
        ctaKey: "nba.proCheckin.cta",
        titleParams: { name: ctx.childName ?? "" },
        badgeKey: "pro_today",
      });
    } else if (ctx.hasCheckedInToday && !ctx.hasCheckedOutToday) {
      actions.push({
        id: "pro_checkout",
        priority: 4,
        stage: "daily_ops_active",
        href: "/(professional)/today",
        variant: "teal",
        icon: "checkin",
        titleKey: "nba.proCheckout.title",
        reasonKey: "nba.proCheckout.reason",
        ctaKey: "nba.proCheckout.cta",
        titleParams: { name: ctx.childName ?? "" },
      });
    }

    const needsLog = ctx.isAfternoon || ctx.hasCheckedOutToday;
    if (needsLog && ctx.todayLogCount === 0) {
      actions.push({
        id: "pro_daily_log",
        priority: 5,
        stage: "daily_ops_log",
        href: "/(active-match)/daily-log-form",
        params: { matchId: ctx.activeMatchId },
        variant: "purple",
        icon: "log",
        titleKey: "nba.proDailyLog.title",
        reasonKey: "nba.proDailyLog.reason",
        ctaKey: "nba.proDailyLog.cta",
        titleParams: { name: ctx.childName ?? "" },
        badgeKey: "pro_today",
      });
    } else if (ctx.todayLogCount > 0) {
      actions.push({
        id: "pro_add_log",
        priority: 6,
        stage: "daily_ops_done",
        href: "/(active-match)/daily-log-form",
        params: { matchId: ctx.activeMatchId },
        variant: "purple",
        icon: "log",
        titleKey: "nba.proAddLog.title",
        reasonKey: "nba.proAddLog.reason",
        ctaKey: "nba.proAddLog.cta",
        titleParams: { count: String(ctx.todayLogCount) },
      });
    }
  }

  if (!ctx.activeMatchId) {
    actions.push({
      id: "pro_browse",
      priority: 7,
      stage: "no_active_match",
      href: "/(professional)/browse",
      variant: "teal",
      icon: "browse",
      titleKey: "nba.proBrowse.title",
      reasonKey: "nba.proBrowse.reason",
      ctaKey: "nba.proBrowse.cta",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

function getParentActions(ctx: NextActionContext): NextActionDefinition[] {
  const actions: NextActionDefinition[] = [];

  if (ctx.interestedRequestId) {
    actions.push({
      id: "parent_approve_request",
      priority: 1,
      stage: "request_needs_approval",
      href: "/(parent)/intro-detail",
      params: { requestId: ctx.interestedRequestId },
      variant: "purple",
      icon: "request",
      titleKey: "nba.parentApprove.title",
      reasonKey: "nba.parentApprove.reason",
      ctaKey: "nba.parentApprove.cta",
      titleParams: { name: ctx.interestedProfessionalName ?? "" },
      badgeKey: "parent_requests",
    });
  }

  if (ctx.hasPendingSentRequest && !ctx.interestedRequestId) {
    actions.push({
      id: "parent_waiting_request",
      priority: 2,
      stage: "awaiting_request_response",
      href: "/(parent)/(tabs)/requests",
      variant: "amber",
      icon: "request",
      titleKey: "nba.parentWaiting.title",
      reasonKey: "nba.parentWaiting.reason",
      ctaKey: "nba.parentWaiting.cta",
    });
  }

  if (ctx.activeMatchId && !ctx.hasCheckedInToday) {
    actions.push({
      id: "parent_no_checkin",
      priority: 3,
      stage: "match_active_routine",
      href: "/(active-match)",
      params: { matchId: ctx.activeMatchId },
      variant: "amber",
      icon: "checkin",
      titleKey: "nba.parentNoCheckin.title",
      reasonKey: "nba.parentNoCheckin.reason",
      ctaKey: "nba.parentNoCheckin.cta",
      titleParams: { name: ctx.professionalName ?? "" },
    });
  }

  if (ctx.latestSummaryLogId && ctx.activeMatchId) {
    actions.push({
      id: "parent_summary_ready",
      priority: 4,
      stage: "match_active_routine",
      href: "/(active-match)/daily-log-detail",
      params: { logId: ctx.latestSummaryLogId, matchId: ctx.activeMatchId },
      variant: "teal",
      icon: "summary",
      titleKey: "nba.parentSummary.title",
      reasonKey: "nba.parentSummary.reason",
      ctaKey: "nba.parentSummary.cta",
      titleParams: { name: ctx.childName ?? "" },
    });
  }

  if (!ctx.hasPublishedChild) {
    actions.push({
      id: "parent_publish_child",
      priority: 5,
      stage: "no_child_published",
      href: "/(parent)/(tabs)/child-profile",
      variant: "purple",
      icon: "publish",
      titleKey: "nba.parentPublish.title",
      reasonKey: "nba.parentPublish.reason",
      ctaKey: "nba.parentPublish.cta",
      titleParams: { name: ctx.childName ?? "" },
    });
  }

  if (!ctx.activeMatchId && !ctx.interestedRequestId) {
    actions.push({
      id: "parent_discover_matches",
      priority: 6,
      stage: "no_active_match",
      href: "/(parent)/(tabs)",
      variant: "teal",
      icon: "browse",
      titleKey: "nba.parentDiscover.title",
      reasonKey: "nba.parentDiscover.reason",
      ctaKey: "nba.parentDiscover.cta",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}

export function getTabBadgeCounts(ctx: NextActionContext): Record<string, number> {
  const badges: Record<string, number> = {};

  if (ctx.role === "professional") {
    if (ctx.pendingRequestId) {
      badges.pro_requests = 1;
    }
    const needsToday =
      ctx.activeMatchId &&
      ctx.verified &&
      ((!ctx.hasCheckedInToday && !ctx.isAfternoon) ||
        ((ctx.isAfternoon || ctx.hasCheckedOutToday) && ctx.todayLogCount === 0));
    if (needsToday) {
      badges.pro_today = 1;
    }
  }

  if (ctx.role === "parent") {
    if (ctx.interestedRequestId) {
      badges.parent_requests = 1;
    }
  }

  return badges;
}
