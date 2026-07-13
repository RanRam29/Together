import { useState } from "react";

import { UsageGuide } from "@/components/guide/UsageGuide";
import { isProfileComplete } from "@/lib/auth-api";
import { guideRole } from "@/lib/guide-content";
import { useAuthStore } from "@/stores/auth-store";
import { useGuideStore } from "@/stores/guide-store";

/**
 * Shows the first-launch usage guide once per role, after the user is signed in
 * and onboarded. Mounted once near the app root. Respects "don't show again".
 */
export function UsageGuideGate() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const guideHydrated = useGuideStore((s) => s.hydrated);
  const dismissedRoles = useGuideStore((s) => s.dismissedRoles);
  const dismiss = useGuideStore((s) => s.dismiss);

  const [closedThisSession, setClosedThisSession] = useState(false);

  if (!isHydrated || !guideHydrated || closedThisSession) return null;
  if (!session || !profile || !isProfileComplete(profile) || !profile.role) return null;

  const gRole = guideRole(profile.role);
  if (dismissedRoles.includes(gRole)) return null;

  return (
    <UsageGuide
      role={profile.role}
      onClose={({ dontShowAgain }) => {
        if (dontShowAgain) dismiss(gRole);
        setClosedThisSession(true);
      }}
    />
  );
}
