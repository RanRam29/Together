import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PlaceholderCard, ScreenShell } from "@/components/ui/Screen";
import { useChildren } from "@/hooks/useChildren";
import { useMatchRequests } from "@/hooks/useMatchRequests";
import { useAuthStore } from "@/stores/auth-store";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-amber",
  interested: "text-teal",
  approved: "text-teal",
  rejected: "text-coral",
  expired: "text-ink-2",
  withdrawn: "text-ink-2",
};

export default function ParentRequestsScreen() {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const parentId = session?.user?.id;
  const { children } = useChildren(parentId);
  const childIds = children.map((c) => c.id);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMatchRequests(parentId, childIds);

  return (
    <ScreenShell title={t("parent.requests")} subtitle={t("parent.requestsSubtitle")}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#534AB7" className="mt-8" />
        ) : requests.length === 0 ? (
          <PlaceholderCard text={t("parent.noRequests")} />
        ) : (
          requests.map((request) => {
            const child = children.find((c) => c.id === request.child_id);
            const statusColor = STATUS_COLORS[request.status] ?? "text-ink-2";

            return (
              <View
                key={request.id}
                className="bg-surface border border-border rounded-card p-5 mb-4"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-bold text-ink font-rubik">
                    {child?.first_name ?? t("parent.childProfile")}
                  </Text>
                  <Text className={`text-sm font-semibold ${statusColor}`}>
                    {t(`enums.requestStatus.${request.status}`)}
                  </Text>
                </View>
                {request.parent_message ? (
                  <Text className="text-sm text-ink-2 leading-5 mb-2">
                    {request.parent_message}
                  </Text>
                ) : null}
                {request.match_reason ? (
                  <Text className="text-xs text-teal">{request.match_reason}</Text>
                ) : null}
              </View>
            );
          })
        )}
        <View className="h-6" />
      </ScrollView>
    </ScreenShell>
  );
}
