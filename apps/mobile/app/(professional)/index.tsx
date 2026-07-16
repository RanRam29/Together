import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { IncomingRequestCard } from "@/components/professional/Cards";
import { ActiveMatchBanner } from "@/components/shared/ActiveMatchBanner";
import { NextActionCard } from "@/components/shared/NextActionCard";
import { NextActionList } from "@/components/shared/NextActionList";
import { PendingInvitations } from "@/components/parent/PendingInvitations";
import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";
import { useActiveMatchForProfessional } from "@/hooks/useActiveMatch";
import {
  useIncomingRequests,
  useMyProfessional,
  useRespondToRequest } from "@/hooks/useProfessional";
import { promptPushPermission } from "@/components/shared/PushPermissionProvider";
import { errorMessage, showError } from "@/lib/feedback";
import { useNextActionNavigation } from "@/hooks/useNextActions";
import { useAuthStore } from "@/stores/auth-store";
import { BrandSpinner } from "@/components/motion/BrandSpinner";
import { colors } from "@/lib/theme";


const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber",
  interested: "text-teal",
  approved: "text-teal",
  rejected: "text-coral",
  expired: "text-ink-2",
  withdrawn: "text-ink-2" };

export default function ProfessionalHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  const { data: professional } = useMyProfessional(userId);
  const professionalId = professional?.id;

  const { data: activeMatch } = useActiveMatchForProfessional(professionalId);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching } = useIncomingRequests(professionalId);

  const respond = useRespondToRequest(professionalId);
  const { primary, secondary, navigateToAction } = useNextActionNavigation({
    role: "professional",
    screen: "pro_home" });

  const nbaRequestId =
    primary?.id === "pro_pending_request"
      ? primary.params?.requestId
      : undefined;
  const visibleRequests = nbaRequestId
    ? requests.filter((r) => r.id !== nbaRequestId)
    : requests;

  const hideMatchBanner =
    primary &&
    ["pro_checkin", "pro_checkout", "pro_daily_log", "pro_add_log"].includes(
      primary.id,
    );

  function handleRespond(requestId: string, status: "interested" | "rejected") {
    respond.mutate(
      { requestId, status },
      {
        onSuccess: () => {
          if (status === "interested" && userId) {
            void promptPushPermission(userId);
          }
        },
        onError: (err) => {
          showError(errorMessage(err, t("common.tryAgain")));
        } },
    );
  }

  return (
    <ScreenShell
      title={t("professional.homeTitle")}
      subtitle={t("professional.homeSubtitle")}
      headerRight={
        <Pressable onPress={() => router.push("/settings")} className="p-2 -me-2 bg-surface rounded-full border border-border">
          <Ionicons name="settings-outline" size={24} color="#0F6E56" />
        </Pressable>
      }
    >
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch}
          tintColor={colors.purple}
          colors={[colors.purple]}
        />
        }
        showsVerticalScrollIndicator={false}
      >
        {primary ? (
          <NextActionCard
            action={primary}
            onPress={() => navigateToAction(primary)}
          />
        ) : null}

        <NextActionList
          actions={secondary}
          onPress={(action) => navigateToAction(action)}
        />

        {activeMatch && !hideMatchBanner ? (
          <ActiveMatchBanner
            title={t("activeMatch.bannerEyebrow")}
            subtitle={t("activeMatch.bannerSubtitleChild", {
              name: activeMatch.child?.first_name ?? "" })}
            actionLabel={t("professional.todayTitle")}
            onPress={() =>
              router.push({ pathname: "/(professional)/today" } as never)
            }
          />
        ) : null}

        <PendingInvitations />

        {isLoading ? (
          <BrandSpinner size="large" />
        ) : visibleRequests.length === 0 ? (
          <View className="bg-surface border border-border rounded-card p-8 items-center mt-6 shadow-sm">
            <View className="w-24 h-24 bg-teal-bg rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-unread-outline" size={40} color="#0F6E56" />
            </View>
            <Text className="text-xl font-bold text-ink mb-2 font-rubik text-center">
              אין פניות כרגע
            </Text>
            <Text className="text-base text-ink-2 text-center leading-6 mb-8">
              זה הזמן לקחת יוזמה! אפשר לחפש משפחות וילדים שמחפשים משלבות באזור שלך.
            </Text>
            <Pressable
              onPress={() => router.push("/(professional)/browse" as never)}
              className="bg-teal rounded-full py-4 px-8 items-center active:opacity-90 w-full"
            >
              <Text className="text-white font-bold font-rubik">לחיפוש משפחות וילדים</Text>
            </Pressable>
          </View>
        ) : (
          visibleRequests.map((request) => {
            const child = request.child;
            const isPending = request.status === "pending";

            return (
              <IncomingRequestCard
                key={request.id}
                childName={child?.first_name ?? t("professional.hiddenChild")}
                age={child?.age ?? 0}
                categoryLabel={
                  child ? t(`enums.needCategory.${child.category}`) : ""
                }
                frameworkLabel={
                  child ? t(`enums.frameworkType.${child.framework}`) : ""
                }
                functioningLabel={
                  child
                    ? t(`parent.functioningLevel${child.functioning_level}`)
                    : ""
                }
                communicationLabel={
                  child
                    ? child.communication_verbal
                      ? t("professional.verbal")
                      : t("professional.nonVerbal")
                    : ""
                }
                statusLabel={
                  request.status === "approved"
                    ? t("professional.waitingForParent")
                    : t(`enums.requestStatus.${request.status}`)
                }
                statusColor={STATUS_COLORS[request.status] ?? "text-ink-2"}
                parentMessage={request.parent_message}
                matchReason={request.match_reason}
                canRespond={isPending}
                viewProfileLabel={t("professional.viewChildProfile")}
                onViewProfile={() =>
                  router.push({
                    pathname: "/(professional)/request-detail",
                    params: { requestId: request.id } } as never)
                }
                respondLabel={t("professional.accept")}
                rejectLabel={t("professional.reject")}
                onAccept={() => handleRespond(request.id, "interested")}
                onReject={() => handleRespond(request.id, "rejected")}
                loading={respond.isPending}
              />
            );
          })
        )}
        <View className="h-6" />
      </ScrollView>
    </ScreenShell>
  );
}
