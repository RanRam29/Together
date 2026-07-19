import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { MetricCard } from "@/components/admin/MetricCard";
import { StaffQueryFeedback } from "@/components/admin/StaffQueryFeedback";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { usePlatformMetrics } from "@/hooks/useAdminDashboard";
import { BrandSpinner } from "@/components/motion/BrandSpinner";


export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin, isReady } = useStaffRoute();
  const metrics = usePlatformMetrics();

  useEffect(() => {
    if (isReady && !isAdmin) {
      router.replace("/(staff)/verification" as never);
    }
  }, [isReady, isAdmin, router]);

  if (!isReady || !isAdmin) {
    return (
      <View className="flex-1 items-center justify-center">
        <BrandSpinner size="large" />
      </View>
    );
  }

  const m = metrics.data;

  return (
    <ScrollView
      className="flex-1 px-6 py-8"
      refreshControl={
        <RefreshControl
          refreshing={metrics.isRefetching}
          onRefresh={() => {
            void metrics.refetch();
          }}
          tintColor="#534ab7"
          colors={["#534ab7"]}
        />
      }
    >
      <Text className="text-[30px] leading-[38px] font-bold text-[#1c1b22] mb-2 font-rubik text-right">
        {t("staff.dashboardTitle", "סקירה כללית")}
      </Text>
      <Text className="text-base text-[#474553] mb-8 font-rubik text-right">
        {t("staff.dashboardSubtitle", "הנתונים מעודכנים בזמן אמת")}
      </Text>

      {metrics.isLoading || metrics.isError ? (
        <StaffQueryFeedback
          isLoading={metrics.isLoading}
          isError={metrics.isError}
          error={metrics.error}
          onRetry={() => void metrics.refetch()}
        />
      ) : m ? (
        <View className="flex-row flex-wrap gap-6 justify-end w-full">
          <MetricCard
            label={t("staff.metricVerified", "משלבות מאומתות")}
            value={m.verifiedProfessionals}
            highlight="success"
            onPress={() => router.push("/(staff)/verification" as never)}
          />
          <MetricCard
            label={t("staff.metricPending", "ממתינות לאימות")}
            value={m.pendingVerification}
            highlight="purple"
            onPress={() => router.push("/(staff)/verification" as never)}
          />
          <MetricCard
            label={t("staff.metricSlaOverdue", "חריגות SLA")}
            value={m.slaOverdue}
            highlight={m.slaOverdue > 0 ? "warning" : "default"}
            onPress={() => router.push("/(staff)/verification" as never)}
          />
          <MetricCard
            label={t("staff.metricParents", "הורים פעילים")}
            value={m.activeParents}
            onPress={() => router.push("/(staff)/users" as never)}
          />
          <MetricCard
            label={t("staff.metricChildren", "ילדים רשומים")}
            value={m.activeChildren}
          />
          <MetricCard
            label={t("staff.metricOpenRequests", "בקשות פתוחות")}
            value={m.openRequests}
          />
          <MetricCard
            label={t("staff.metricActiveMatches", "התאמות פעילות")}
            value={m.activeMatches}
            highlight="success"
            onPress={() => router.push("/(staff)/matches" as never)}
          />
          <MetricCard
            label={t("staff.metricCheckinsToday", "צ'ק-אין היום")}
            value={m.checkinsToday}
          />
          <MetricCard
            label={t("staff.metricLogsToday", "דיווחי יומן היום")}
            value={m.dailyLogsToday}
          />
        </View>
      ) : null}

      <View className="h-12" />
    </ScrollView>
  );
}
