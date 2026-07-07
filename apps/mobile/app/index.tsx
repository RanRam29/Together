import { Redirect } from "expo-router";

import { useAuthStore } from "@/stores/auth-store";

export default function Index() {
  const { session, profile, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile?.role) return <Redirect href="/(auth)/role-select" />;
  if (profile.role === "parent") return <Redirect href="/(parent)" />;
  if (profile.role === "professional") return <Redirect href="/(professional)" />;

  return <Redirect href="/(auth)/login" />;
}
