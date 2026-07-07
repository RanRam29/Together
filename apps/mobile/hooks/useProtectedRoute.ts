import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";

import { isProfileComplete } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

type RouteGroup = "(auth)" | "(parent)" | "(professional)" | "(active-match)";

const AUTH_SETUP_SCREENS = new Set([
  "role-select",
  "login",
  "verify-otp",
  "onboarding",
]);

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
    const profileComplete = isProfileComplete(profile);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/role-select");
      return;
    }

    if (session && !profileComplete && subSegment !== "onboarding") {
      router.replace("/(auth)/onboarding");
      return;
    }

    if (session && profileComplete && inAuthGroup && AUTH_SETUP_SCREENS.has(subSegment ?? "")) {
      if (roleGroup === "(parent)") {
        router.replace("/(parent)/(tabs)");
      } else if (roleGroup === "(professional)") {
        router.replace("/(professional)");
      }
      return;
    }

    // Role separation: block cross-role access to the other role's group.
    if (session && profileComplete && roleGroup) {
      const inParentGroup = rootSegment === "(parent)";
      const inProfessionalGroup = rootSegment === "(professional)";

      if (roleGroup === "(parent)" && inProfessionalGroup) {
        router.replace("/(parent)/(tabs)");
        return;
      }
      if (roleGroup === "(professional)" && inParentGroup) {
        router.replace("/(professional)");
        return;
      }
    }
  }, [session, profile, segments, isHydrated, router]);
}
