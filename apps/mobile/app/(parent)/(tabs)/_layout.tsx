import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ParentTabsLayout() {
  const { t } = useTranslation();

  const tabBarStyle =
    Platform.OS === "web"
      ? {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E2DA",
          maxWidth: 672,
          width: "100%" as const,
          alignSelf: "center" as const,
        }
      : { backgroundColor: "#FFFFFF", borderTopColor: "#E5E2DA" };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#534AB7",
        tabBarInactiveTintColor: "#918D84",
        tabBarStyle,
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
