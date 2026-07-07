import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ParentRequestsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("parent.requests")}>
      <PlaceholderCard text="Match requests — week 3–5" />
    </ScreenShell>
  );
}
