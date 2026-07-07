import { ParentOnboarding } from "@/components/onboarding/ParentOnboarding";
import { ProfessionalOnboarding } from "@/components/onboarding/ProfessionalOnboarding";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function OnboardingScreen() {
  const profileRole = useAuthStore((s) => s.profile?.role);
  const selectedRole = useOnboardingStore((s) => s.selectedRole);

  const role = selectedRole ?? profileRole ?? "parent";

  if (role === "professional") {
    return <ProfessionalOnboarding />;
  }

  return <ParentOnboarding />;
}
