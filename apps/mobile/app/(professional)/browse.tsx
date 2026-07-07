import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ProfessionalBrowseScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell
      title={t("professional.browse")}
      subtitle={t("professional.browseSubtitle")}
    >
      <PlaceholderCard text="TIER 0 browse cards — week 3–5" />
    </ScreenShell>
  );
}
