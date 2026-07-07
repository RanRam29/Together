import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ParentLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#534AB7",
        tabBarInactiveTintColor: "#918D84",
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#E5E2DA" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("parent.homeTitle") }} />
      <Tabs.Screen name="child-profile" options={{ title: t("parent.childProfile") }} />
      <Tabs.Screen name="requests" options={{ title: t("parent.requests") }} />
    </Tabs>
  );
}
