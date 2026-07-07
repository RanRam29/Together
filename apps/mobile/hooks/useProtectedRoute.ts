import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

import { useAuthStore } from "@/stores/auth-store";

type RouteGroup = "(auth)" | "(parent)" | "(professional)" | "(active-match)";

function getRoleGroup(role: string | undefined): RouteGroup | null {
  if (role === "parent") return "(parent)";
  if (role === "professional") return "(professional)";
  return null;
}

export function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments() as string[];
  const { session, profile, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    const rootSegment = segments[0];
    const subSegment = segments[1];
    const inAuthGroup = rootSegment === "(auth)";
    const roleGroup = getRoleGroup(profile?.role);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (session && !profile?.role && subSegment !== "role-select") {
      router.replace("/(auth)/role-select");
      return;
    }

    if (session && roleGroup && rootSegment === "(active-match)") {
      return;
    }

    if (session && roleGroup && inAuthGroup && subSegment !== "onboarding") {
      router.replace(roleGroup === "(parent)" ? "/(parent)" : "/(professional)");
    }
  }, [session, profile, segments, isHydrated, router]);
}
