type NotificationData = Record<string, unknown>;

export type PushRoute = {
  pathname: string;
  params?: Record<string, string>;
};

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
    case "waitlist_match_found":
      return { pathname: "/(parent)/(tabs)" };
    case "parent_request_expiring":
      return { pathname: "/(parent)/(tabs)/requests" };
    default:
      return null;
  }
}

export const PARENT_NOTIFICATION_TYPES = new Set([
  "request_interested",
  "request_declined",
  "checkin",
  "daily_summary_ready",
  "review_request",
  "match_paused",
  "waitlist_match_found",
  "parent_request_expiring",
]);

export const PROFESSIONAL_NOTIFICATION_TYPES = new Set([
  "match_request",
  "request_no_answer",
  "match_created",
  "daily_log_reminder",
  "professional_verified",
  "professional_rejected",
  "document_rejected",
  "match_paused",
]);

export function isParentNotificationType(type: string): boolean {
  return PARENT_NOTIFICATION_TYPES.has(type);
}

export function isProfessionalNotificationType(type: string): boolean {
  return PROFESSIONAL_NOTIFICATION_TYPES.has(type);
}
