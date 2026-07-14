import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "expo-router";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { useActiveMatchForParent, useActiveMatchForProfessional } from "@/hooks/useActiveMatch";
import { useTodayCheckin } from "@/hooks/useCheckins";
import { useGetDailyLogs } from "@/hooks/useDailyLogs";
import { useChildren } from "@/hooks/useChildren";
import { useMatchRequests } from "@/hooks/useMatchRequests";
import {
  useIncomingRequests,
  useMyProfessional,
} from "@/hooks/useProfessional";
import { isProfessionalVerified } from "@/lib/verification";
import {
  deriveJourneyStage,
  getNextActions,
  getPrimaryNextAction,
  getSecondaryNextActions,
  getTabBadgeCounts,
} from "@/lib/navigation/next-actions";
import type { NextActionContext, NextActionDefinition } from "@/lib/navigation/types";
import { useAuthStore } from "@/stores/auth-store";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export function useNextActionContext(role: "parent" | "professional"): NextActionContext {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const hour = new Date().getHours();
  const isAfternoon = hour >= 14;

  const { data: professional } = useMyProfessional(
    role === "professional" ? userId : undefined,
  );
  const professionalId = professional?.id;
  const verified = isProfessionalVerified(professional);

  const parentActive = useActiveMatchForParent(role === "parent" ? userId : undefined);
  const proActive = useActiveMatchForProfessional(
    role === "professional" ? professionalId : undefined,
  );
  const activeMatch = role === "parent" ? parentActive.data : proActive.data;
  const matchId = activeMatch?.id ?? "";

  const { todayCheckin } = useTodayCheckin(matchId);
  const logs = useGetDailyLogs(matchId);

  const { children = [] } = useChildren(role === "parent" ? userId : undefined);
  const childIds = children.map((c) => c.id);
  const { data: requests = [] } = useMatchRequests(
    role === "parent" ? userId : undefined,
    childIds,
  );
  const { data: incomingRequests = [] } = useIncomingRequests(
    role === "professional" ? professionalId : undefined,
  );

  const todayLogs =
    logs.data?.filter((log) => log.log_date === todayIso()) ?? [];

  const interested = requests.find((r) => r.status === "interested");
  const pendingSent = requests.find(
    (r) => r.status === "pending" && r.initiated_by === "parent",
  );
  const pendingIncoming = incomingRequests.find((r) => r.status === "pending");

  const latestWithSummary = logs.data?.find(
    (log) => log.log_date === todayIso() && log.ai_summary,
  );

  const selectedChild = children.find((c) => c.published) ?? children[0];

  return useMemo(
    (): NextActionContext => ({
      role,
      hour,
      isAfternoon,
      verified,
      activeMatchId: matchId || undefined,
      childName:
        role === "parent"
          ? activeMatch?.child?.first_name ?? selectedChild?.first_name
          : activeMatch?.child?.first_name,
      professionalName: activeMatch?.professional?.display_name,
      pendingRequestId: pendingIncoming?.id,
      interestedRequestId: interested?.id,
      interestedProfessionalName: interested?.professional?.display_name,
      hasCheckedInToday: todayCheckin?.is_valid === true,
      hasCheckedOutToday:
        todayCheckin?.is_valid === true && todayCheckin?.checkout_at != null,
      todayLogCount: todayLogs.length,
      hasPublishedChild: children.some((c) => c.published),
      hasPendingSentRequest: Boolean(pendingSent),
      latestSummaryLogId: latestWithSummary?.id,
    }),
    [
      role,
      hour,
      isAfternoon,
      verified,
      matchId,
      activeMatch,
      selectedChild,
      pendingIncoming?.id,
      interested,
      pendingSent,
      todayCheckin,
      todayLogs.length,
      children,
      latestWithSummary?.id,
    ],
  );
}

export function useNextActions(role: "parent" | "professional") {
  const ctx = useNextActionContext(role);
  const actions = useMemo(() => getNextActions(ctx), [ctx]);
  const primary = useMemo(() => getPrimaryNextAction(ctx), [ctx]);
  const secondary = useMemo(() => getSecondaryNextActions(ctx), [ctx]);
  const stage = useMemo(() => deriveJourneyStage(ctx), [ctx]);
  const badges = useMemo(() => getTabBadgeCounts(ctx), [ctx]);

  return { ctx, actions, primary, secondary, stage, badges };
}

interface UseNextActionNavigationOptions {
  role: "parent" | "professional";
  screen: string;
}

export function useNextActionNavigation({
  role,
  screen,
}: UseNextActionNavigationOptions) {
  const router = useRouter();
  const { primary, secondary, stage } = useNextActions(role);
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!primary || trackedRef.current === primary.id) return;
    trackedRef.current = primary.id;
    void track(AnalyticsEvents.NBA_SHOWN, {
      action_id: primary.id,
      stage,
      screen,
      priority: primary.priority,
    });
  }, [primary, screen, stage]);

  function navigateToAction(action: NextActionDefinition) {
    void track(AnalyticsEvents.NBA_TAPPED, {
      action_id: action.id,
      stage: action.stage,
      screen,
    });

    if (action.params) {
      router.push({
        pathname: action.href,
        params: action.params,
      } as never);
    } else {
      router.push(action.href as never);
    }
  }

  return { primary, secondary, navigateToAction };
}
