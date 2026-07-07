import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ActiveMatchScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell
      title={t("activeMatch.title")}
      subtitle={t("activeMatch.subtitle")}
    >
      <PlaceholderCard text="EVV check-in + daily log — week 5–7" />
    </ScreenShell>
  );
}
