import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

import { getTabBarStyle } from "@/lib/platform";
import { colors } from "@/lib/theme";
import { useNextActions } from "@/hooks/useNextActions";
import { useSmartLanding } from "@/hooks/useSmartLanding";

export default function ParentTabsLayout() {
  const { t } = useTranslation();
  const { badges } = useNextActions("parent");
  useSmartLanding("parent");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: getTabBarStyle({ wide: true }),
        tabBarLabelStyle: { fontFamily: "Rubik_500Medium", fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("parent.tabMatches"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="child-profile"
        options={{
          title: t("parent.tabChild"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: t("parent.tabRequests"),
          tabBarBadge: badges.parent_requests || undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
