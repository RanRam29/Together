import { Redirect } from "expo-router";

import { isProfileComplete } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const { session, profile, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  if (!session) return <Redirect href="/(auth)/role-select" />;

  if (!isProfileComplete(profile)) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (profile?.role === "parent") return <Redirect href="/(parent)" />;
  if (profile?.role === "professional") return <Redirect href="/(professional)" />;

  return <Redirect href="/(auth)/role-select" />;
}
