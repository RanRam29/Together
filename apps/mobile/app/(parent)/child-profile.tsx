import { useTranslation } from "react-i18next";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";

export default function ChildProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScreenShell title={t("parent.childProfile")}>
      <PlaceholderCard text="Child profile form — week 2–3" />
    </ScreenShell>
  );
}
