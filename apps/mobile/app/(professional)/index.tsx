import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ProfessionalHomeScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell
      title={t("professional.homeTitle")}
      subtitle={t("professional.homeSubtitle")}
    >
      <PlaceholderCard text={t("professional.noRequests")} />
    </ScreenShell>
  );
}
