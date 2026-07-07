import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ProfessionalProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("professional.profile")}>
      <PlaceholderCard text="Professional profile + documents — week 2–3" />
    </ScreenShell>
  );
}
