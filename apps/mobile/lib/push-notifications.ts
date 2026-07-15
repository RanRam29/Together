import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import type { Router } from "expo-router";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import {
  isParentNotificationType,
  isProfessionalNotificationType,
  resolveNotificationRoute,
  type PushRoute,
} from "@/lib/navigation/resolve-push-route";
import { supabase } from "@/lib/supabase";

export {
  isParentNotificationType,
  isProfessionalNotificationType,
  resolveNotificationRoute,
  type PushRoute,
};

let lastRegisteredToken: string | undefined;

export function getStoredPushToken(): string | undefined {
  return lastRegisteredToken;
}

type NotificationData = Record<string, unknown>;

function str(data: NotificationData, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function handleNotificationNavigation(
  data: NotificationData,
  router: Router,
): void {
  const type = str(data, "type");
  const route = resolveNotificationRoute(data);
  if (!route) return;

  void track(AnalyticsEvents.PUSH_OPENED, {
    type: type ?? "unknown",
    routed_to: route.pathname,
  });

  if (route.params) {
    router.push({
      pathname: route.pathname,
      params: route.params,
    } as never);
  } else {
    router.push(route.pathname as never);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(
  userId: string,
  silent: boolean = false,
): Promise<string | undefined> {
  if (Platform.OS === "web") {
    return undefined;
  }

  let token: string | undefined;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#534AB7",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      if (silent) {
        return undefined;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return undefined;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      console.warn("EAS projectId not found. Push notifications may not work.");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      token = pushTokenString;
    } catch (e: unknown) {
      console.warn("Error getting push token:", e);
    }
  } else {
    return undefined;
  }

  if (token) {
    lastRegisteredToken = token;
    try {
      await (supabase as any).from("push_tokens").upsert(
        {
          user_id: userId,
          token: token,
          platform: Platform.OS,
        },
        { onConflict: "user_id,token" },
      );
    } catch (error) {
      console.error("Failed to save push token:", error);
    }
  }

  return token;
}

export async function removePushToken(userId: string, token: string): Promise<void> {
  try {
    await (supabase as any).from("push_tokens").delete().match({ user_id: userId, token: token });
  } catch (error) {
    console.error("Failed to remove push token:", error);
  }
}
