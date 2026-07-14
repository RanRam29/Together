import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import type { Router } from "expo-router";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { supabase } from "@/lib/supabase";

let lastRegisteredToken: string | undefined;

export function getStoredPushToken(): string | undefined {
  return lastRegisteredToken;
}

type NotificationData = Record<string, unknown>;

type PushRoute = {
  pathname: string;
  params?: Record<string, string>;
};

const PARENT_NOTIFICATION_TYPES = new Set([
  "request_interested",
  "request_declined",
  "checkin",
  "daily_summary_ready",
  "review_request",
  "match_paused",
]);

const PROFESSIONAL_NOTIFICATION_TYPES = new Set([
  "match_request",
  "request_no_answer",
  "match_created",
  "daily_log_reminder",
  "professional_verified",
  "professional_rejected",
  "document_rejected",
  "match_paused",
]);

function str(data: NotificationData, key: string): string | undefined {
  const value = data[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function resolveNotificationRoute(data: NotificationData): PushRoute | null {
  const type = str(data, "type");
  if (!type) return null;

  switch (type) {
    case "match_request":
    case "request_no_answer": {
      const requestId = str(data, "request_id");
      if (requestId) {
        return {
          pathname: "/(professional)/request-detail",
          params: { requestId },
        };
      }
      return { pathname: "/(professional)" };
    }
    case "request_interested": {
      const requestId = str(data, "request_id");
      if (requestId) {
        return {
          pathname: "/(parent)/intro-detail",
          params: { requestId },
        };
      }
      return { pathname: "/(parent)/(tabs)/requests" };
    }
    case "request_declined": {
      const requestId = str(data, "request_id");
      if (requestId) {
        return {
          pathname: "/(parent)/(tabs)/requests",
          params: { highlightRequestId: requestId },
        };
      }
      return { pathname: "/(parent)/(tabs)/requests" };
    }
    case "match_created": {
      const matchId = str(data, "match_id");
      if (!matchId) return { pathname: "/(professional)/today" };
      return {
        pathname: "/(active-match)",
        params: { matchId },
      };
    }
    case "checkin": {
      const matchId = str(data, "match_id");
      if (matchId) {
        return { pathname: "/(active-match)", params: { matchId } };
      }
      return { pathname: "/(active-match)" };
    }
    case "daily_summary_ready": {
      const logId = str(data, "log_id");
      const matchId = str(data, "match_id");
      if (logId) {
        return {
          pathname: "/(active-match)/daily-log-detail",
          params: {
            logId,
            ...(matchId ? { matchId } : {}),
          },
        };
      }
      if (matchId) {
        return { pathname: "/(active-match)", params: { matchId } };
      }
      return { pathname: "/(active-match)" };
    }
    case "daily_log_reminder": {
      const matchId = str(data, "match_id");
      if (!matchId) return { pathname: "/(professional)/today" };
      return {
        pathname: "/(active-match)/daily-log-form",
        params: { matchId },
      };
    }
    case "review_request": {
      const matchId = str(data, "match_id");
      if (!matchId) return { pathname: "/(active-match)/review" };
      return {
        pathname: "/(active-match)/review",
        params: { matchId },
      };
    }
    case "match_paused": {
      const matchId = str(data, "match_id");
      if (matchId) {
        return { pathname: "/(active-match)", params: { matchId } };
      }
      return { pathname: "/(active-match)" };
    }
    case "professional_verified":
    case "professional_rejected":
    case "document_rejected":
      return { pathname: "/(professional)/documents" };
    default:
      return null;
  }
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

export function isParentNotificationType(type: string): boolean {
  return PARENT_NOTIFICATION_TYPES.has(type);
}

export function isProfessionalNotificationType(type: string): boolean {
  return PROFESSIONAL_NOTIFICATION_TYPES.has(type);
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
