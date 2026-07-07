import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ParentHomeScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell
      title={t("parent.homeTitle")}
      subtitle={t("parent.homeSubtitle")}
    >
      <PlaceholderCard text={t("parent.noMatches")} />
    </ScreenShell>
  );
}
