import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ApproveDisclosureSheet } from "@/components/parent/ApproveDisclosureSheet";
import { InterestedRequestCards } from "@/components/parent/LetterCard";
import { NextActionCard } from "@/components/shared/NextActionCard";
import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";
import { useChildren } from "@/hooks/useChildren";
import { useNextActionNavigation } from "@/hooks/useNextActions";
import {
  useApproveMatchRequest,
  useMatchRequests,
  useRejectMatchRequest } from "@/hooks/useMatchRequests";
import { formatMatchReason } from "@/lib/format-match-reason";
import { confirmAction, errorMessage, showError, showSuccess } from "@/lib/feedback";
import { getParentRequestStatusLabel } from "@/lib/request-labels";
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

export default function ParentRequestsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { highlightRequestId } = useLocalSearchParams<{
    highlightRequestId?: string;
  }>();
  const session = useAuthStore((s) => s.session);
  const parentId = session?.user?.id;
  const { primary, navigateToAction } = useNextActionNavigation({
    role: "parent",
    screen: "parent_requests" });

  const hideInterestedCards = primary?.id === "parent_approve_request";
  const { children } = useChildren(parentId);
  const childIds = children.map((c) => c.id);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching } = useMatchRequests(parentId, childIds);

  const approveRequest = useApproveMatchRequest(parentId);
  const rejectRequest = useRejectMatchRequest(parentId);

  const [pendingApproveId, setPendingApproveId] = useState<string | null>(null);
  const pendingRequest = requests.find((request) => request.id === pendingApproveId);
  const pendingProfessionalName =
    pendingRequest?.professional?.display_name ?? t("parent.professionalFallback");

  const disclosureItems = [
    t("parent.disclosureFullName"),
    t("parent.disclosureDiagnosis"),
    t("parent.disclosureWhatWorks"),
    t("parent.disclosureContact"),
  ];

  const interestedRequests = requests
    .filter((r) => r.status === "interested")
    .map((r) => {
      const child = children.find((c) => c.id === r.child_id);
      return {
        id: r.id,
        cover_letter: r.cover_letter,
        parent_message: r.parent_message,
        match_reason: r.match_reason,
        childName: child?.first_name ?? t("parent.childProfile"),
        professionalName:
          r.professional?.display_name ?? t("parent.professionalFallback") };
    })
    .filter(
      (r) =>
        r.cover_letter?.trim() ||
        r.parent_message?.trim() ||
        r.match_reason?.trim(),
    );

  const interestedIds = new Set(interestedRequests.map((r) => r.id));
  const otherRequests = requests.filter((r) => !interestedIds.has(r.id));

  async function confirmApprove() {
    if (!pendingApproveId) return;
    const approvedId = pendingApproveId;
    try {
      await approveRequest.mutateAsync(approvedId);
      setPendingApproveId(null);
      router.push({
        pathname: "/(parent)/intro-detail",
        params: { requestId: approvedId } });
    } catch (err) {
      showError(errorMessage(err, t("common.tryAgain")));
    }
  }

  async function handleReject(requestId: string) {
    const confirmed = await confirmAction(
      t("parent.rejectTitle"),
      t("parent.rejectConfirm"),
      {
        confirmText: t("parent.rejectAction"),
        cancelText: t("common.cancel"),
        destructive: true },
    );
    if (!confirmed) return;

    try {
      await rejectRequest.mutateAsync(requestId);
      showSuccess({ title: t("parent.requestRejected") });
    } catch (err) {
      showError(errorMessage(err, t("common.tryAgain")));
    }
  }

  return (
    <ScreenShell title={t("parent.requests")} subtitle={t("parent.requestsSubtitle")}>
      <ApproveDisclosureSheet
        visible={Boolean(pendingApproveId)}
        professionalName={pendingProfessionalName}
        title={t("parent.disclosureTitle")}
        items={disclosureItems}
        confirmLabel={t("parent.disclosureConfirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmApprove}
        onCancel={() => setPendingApproveId(null)}
        loading={approveRequest.isPending}
      />

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
        {primary &&
        (primary.id === "parent_approve_request" ||
          primary.id === "parent_waiting_request") ? (
          <NextActionCard
            action={primary}
            onPress={() => navigateToAction(primary)}
          />
        ) : null}

        {isLoading ? (
          <BrandSpinner size="large" />
        ) : requests.length === 0 ? (
          <PlaceholderCard text={t("parent.noRequests")} />
        ) : (
          <>
            {!hideInterestedCards ? (
              <InterestedRequestCards
                requests={interestedRequests}
                onApprove={setPendingApproveId}
              />
            ) : null}

            {otherRequests.map((request) => {
              const child = children.find((c) => c.id === request.child_id);
              const professionalName =
                request.professional?.display_name ?? t("parent.professionalFallback");
              const childName = child?.first_name ?? t("parent.childProfile");
              const statusColor = STATUS_COLORS[request.status] ?? "text-ink-2";
              const statusLabel = getParentRequestStatusLabel(
                request,
                professionalName,
                t,
              );
              const showActions =
                request.status === "pending" &&
                request.initiated_by === "professional";

              const isSecondary = child?.secondary_parent_id === parentId;
              const canApprove =
                (child?.secondary_parent_permissions as { can_approve?: boolean } | null)
                  ?.can_approve ?? false;
              const canManage = !isSecondary || canApprove;

              return (
                <View
                  key={request.id}
                  className={`bg-surface border rounded-card p-5 mb-4 ${
                    request.id === highlightRequestId
                      ? "border-purple border-2"
                      : "border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1 me-3">
                      <Text className="text-base font-bold text-ink font-rubik text-start">
                        {professionalName}
                      </Text>
                      <Text className="text-sm text-ink-2 text-start">
                        {t("parent.requestForChild", { name: childName })}
                      </Text>
                    </View>
                    <Text className={`text-sm font-semibold shrink-0 ${statusColor}`}>
                      {statusLabel}
                    </Text>
                  </View>
                  {request.parent_message ? (
                    <Text className="text-sm text-ink-2 leading-5 mb-2 text-start">
                      {request.parent_message}
                    </Text>
                  ) : null}
                  {request.match_reason ? (
                    <Text className="text-xs text-teal mb-3 text-start">
                      {formatMatchReason(request.match_reason, t)}
                    </Text>
                  ) : null}

                  {showActions ? (
                    <View className="flex-row flex-wrap gap-2 mt-4 justify-start">
                      <Pressable
                        onPress={() => setPendingApproveId(request.id)}
                        disabled={
                          !canManage ||
                          approveRequest.isPending ||
                          rejectRequest.isPending
                        }
                        className={`${!canManage ? "opacity-50" : ""} bg-purple rounded-full px-5 py-2 items-center justify-center active:opacity-90`}
                      >
                        <Text className="text-white text-sm font-semibold font-rubik">
                          {t("parent.approveRequest")}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleReject(request.id)}
                        disabled={
                          !canManage ||
                          approveRequest.isPending ||
                          rejectRequest.isPending
                        }
                        className={`${!canManage ? "opacity-50" : ""} rounded-full border border-coral px-4 py-2 items-center justify-center active:opacity-90`}
                      >
                        <Text className="text-coral text-sm font-semibold font-rubik">
                          {t("parent.rejectRequest")}
                        </Text>
                      </Pressable>
                    </View>
                  ) : request.status === "approved" ? (
                    <View className="mt-4 items-start">
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/(parent)/intro-detail",
                            params: { requestId: request.id } })
                        }
                        className="bg-teal rounded-full px-5 py-2 items-center justify-center active:opacity-90"
                      >
                        <Text className="text-white text-sm font-semibold font-rubik">
                          {t("parent.viewIntroDetails")}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </>
        )}
        <View className="h-6" />
      </ScrollView>
    </ScreenShell>
  );
}
