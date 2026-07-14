import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

import { useNextActions } from "@/hooks/useNextActions";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  landingStorageKey,
  resolveLandingRoute,
} from "@/lib/navigation/resolve-landing";
import { isSmartLandingEnabled } from "@/lib/navigation/landing-prefs";
import { useAuthStore } from "@/stores/auth-store";

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function isDefaultHomeTab(
  role: "parent" | "professional",
  segments: string[],
): boolean {
  if (role === "professional") {
    return (
      segments[0] === "(professional)" &&
      (segments.length === 1 || segments[1] === "index")
    );
  }

  return (
    segments[0] === "(parent)" &&
    segments[1] === "(tabs)" &&
    (segments.length === 2 || segments[2] === "index")
  );
}

export function useSmartLanding(role: "parent" | "professional") {
  const router = useRouter();
  const segments = useSegments() as string[];
  const userId = useAuthStore((s) => s.session?.user?.id);
  const profileRole = useAuthStore((s) => s.profile?.role);
  const { stage, ctx } = useNextActions(role);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!userId || profileRole !== role || attemptedRef.current) return;
    if (!isDefaultHomeTab(role, segments)) return;

    const target = resolveLandingRoute(ctx, stage);
    if (!target) return;

    attemptedRef.current = true;

    async function redirect() {
      const enabled = await isSmartLandingEnabled();
      if (!enabled) return;

      const key = landingStorageKey(userId!, todayIso());
      const alreadyResolved = await AsyncStorage.getItem(key);
      if (alreadyResolved) return;

      await AsyncStorage.setItem(key, target!);
      void track(AnalyticsEvents.LANDING_REDIRECT, {
        from: "index",
        to_tab: target!,
        stage,
      });
      router.replace(target! as never);
    }

    void redirect();
  }, [userId, profileRole, role, segments, stage, ctx, router]);
}
