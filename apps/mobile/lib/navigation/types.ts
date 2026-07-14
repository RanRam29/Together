export type JourneyStage =
  | "onboarding_incomplete"
  | "awaiting_verification"
  | "verification_rejected"
  | "no_child_published"
  | "no_active_match"
  | "awaiting_request_response"
  | "request_needs_approval"
  | "pro_pending_requests"
  | "daily_ops_morning"
  | "daily_ops_active"
  | "daily_ops_log"
  | "daily_ops_done"
  | "match_active_routine";

export type NextActionId =
  | "pro_verify_docs"
  | "pro_pending_request"
  | "pro_checkin"
  | "pro_checkout"
  | "pro_daily_log"
  | "pro_add_log"
  | "pro_browse"
  | "parent_approve_request"
  | "parent_waiting_request"
  | "parent_no_checkin"
  | "parent_summary_ready"
  | "parent_publish_child"
  | "parent_discover_matches";

export type NextActionIcon =
  | "checkin"
  | "log"
  | "request"
  | "publish"
  | "docs"
  | "summary"
  | "browse";

export interface NextActionContext {
  role: "parent" | "professional";
  hour: number;
  isAfternoon: boolean;
  verified: boolean;
  activeMatchId?: string;
  childName?: string;
  professionalName?: string;
  pendingRequestId?: string;
  interestedRequestId?: string;
  interestedProfessionalName?: string;
  hasCheckedInToday: boolean;
  hasCheckedOutToday: boolean;
  todayLogCount: number;
  hasPublishedChild: boolean;
  hasPendingSentRequest: boolean;
  latestSummaryLogId?: string;
}

export interface NextActionDefinition {
  id: NextActionId;
  priority: number;
  stage: JourneyStage;
  href: string;
  params?: Record<string, string>;
  variant: "purple" | "teal" | "amber";
  icon: NextActionIcon;
  titleKey: string;
  reasonKey: string;
  ctaKey: string;
  titleParams?: Record<string, string>;
  reasonParams?: Record<string, string>;
  badgeKey?: string;
}
