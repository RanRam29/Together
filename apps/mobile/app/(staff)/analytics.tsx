import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { StaffQueryFeedback } from "@/components/admin/StaffQueryFeedback";
import {
  useAdminReportFunnel,
  useAdminReportOverview,
  useAdminReportTimeseries,
  useAdminReportVerificationSla,
} from "@/hooks/useAdminReports";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { ActivityIndicator } from "react-native";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { useAdminMfa } from "@/hooks/useAdminMfa";
import { useEffect } from "react";

// For demo purposes, hardcoding a recent date range. In a real app, this would be a date picker.
const today = new Date();
const lastMonth = new Date();
lastMonth.setMonth(today.getMonth() - 1);

const formatDate = (d: Date) => d.toISOString().split("T")[0];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { isReady, isAdmin } = useStaffRoute();
  const mfa = useAdminMfa(isAdmin);
  
  const fromDate = formatDate(lastMonth);
  const toDate = formatDate(today);

  const overview = useAdminReportOverview();
  const funnel = useAdminReportFunnel(fromDate, toDate);
  const timeseries = useAdminReportTimeseries("new_users", fromDate, toDate);
  const sla = useAdminReportVerificationSla();

  useEffect(() => {
    // Check MFA errors and show modal if needed
    if (overview.error) mfa.handleRpcError(overview.error);
    if (funnel.error) mfa.handleRpcError(funnel.error);
    if (timeseries.error) mfa.handleRpcError(timeseries.error);
    if (sla.error) mfa.handleRpcError(sla.error);
  }, [overview.error, funnel.error, timeseries.error, sla.error, mfa]);

  if (!isReady || !isAdmin) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#534AB7" />
      </View>
    );
  }

  const isLoading = overview.isLoading || funnel.isLoading || timeseries.isLoading || sla.isLoading;
  const isError = overview.isError || funnel.isError || timeseries.isError || sla.isError;
  const isRefetching = overview.isRefetching || funnel.isRefetching || timeseries.isRefetching || sla.isRefetching;

  const handleRefresh = () => {
    void overview.refetch();
    void funnel.refetch();
    void timeseries.refetch();
    void sla.refetch();
  };

  return (
    <ScrollView
      className="flex-1 px-6 py-6"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
    >
      <Text className="text-2xl font-bold text-ink mb-2 font-rubik text-right">
        דוחות מערכת (Admin Reports)
      </Text>
      <Text className="text-sm text-ink-2 mb-6 text-right">
        נתונים מצטברים בלבד. הדוחות אינם כוללים מידע מזהה (PII).
      </Text>

      {isLoading || isError ? (
        <StaffQueryFeedback
          isLoading={isLoading}
          isError={isError}
          error={overview.error || funnel.error || timeseries.error || sla.error}
          onRetry={handleRefresh}
        />
      ) : (
        <>
          {overview.data ? (
            <View className="mt-2 bg-purple-bg border border-purple rounded-card p-5 mb-6">
              <Text className="text-lg font-bold text-purple-ink mb-2 font-rubik text-right">
                תמונת מצב (Overview)
              </Text>
              <View className="flex-row flex-wrap gap-4 justify-end">
                <View className="bg-white p-3 rounded-lg border border-border min-w-[120px]">
                  <Text className="text-sm text-ink-2 text-right">הורים פעילים</Text>
                  <Text className="text-xl font-bold text-ink text-right">{overview.data.active_users_parent}</Text>
                </View>
                <View className="bg-white p-3 rounded-lg border border-border min-w-[120px]">
                  <Text className="text-sm text-ink-2 text-right">משלבות פעילות</Text>
                  <Text className="text-xl font-bold text-ink text-right">{overview.data.active_users_professional}</Text>
                </View>
                <View className="bg-white p-3 rounded-lg border border-border min-w-[120px]">
                  <Text className="text-sm text-ink-2 text-right">התאמות פעילות</Text>
                  <Text className="text-xl font-bold text-ink text-right">{overview.data.matches_active}</Text>
                </View>
                <View className="bg-white p-3 rounded-lg border border-border min-w-[120px]">
                  <Text className="text-sm text-ink-2 text-right">בתור לאימות</Text>
                  <Text className="text-xl font-bold text-ink text-right">{overview.data.professionals_pending_verification}</Text>
                </View>
                <View className="bg-white p-3 rounded-lg border border-border min-w-[120px]">
                  <Text className="text-sm text-ink-2 text-right">זמן המתנה ממוצע (ימים)</Text>
                  <Text className="text-xl font-bold text-ink text-right">
                    {overview.data.avg_wait_days_for_verification !== null ? overview.data.avg_wait_days_for_verification.toFixed(1) : "-"}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {funnel.data ? (
            <View className="mt-2 bg-surface border border-border rounded-card p-5 mb-6">
              <Text className="text-lg font-bold text-ink mb-2 font-rubik text-right">
                משפך בקשות
              </Text>
              <FunnelChart
                bars={[
                  { label: "נשלחו (Sent)", value: funnel.data.total_sent },
                  { label: "הביעו עניין (Interested)", value: funnel.data.total_interested },
                  { label: "אושרו (Approved)", value: funnel.data.total_approved },
                  { label: "הפכו להתאמה (Matched)", value: funnel.data.total_became_match },
                  { label: "התאמות פעילות כיום", value: funnel.data.currently_active_matches },
                ].filter(b => b.value > 0)}
              />
              <Text className="text-base font-semibold text-teal text-right mt-4">
                יחס המרה לבקשה מאושרת: {funnel.data.pct_sent_to_approved}%
              </Text>
            </View>
          ) : null}

          {sla.data && sla.data.length > 0 ? (
            <View className="mt-2 bg-surface border border-border rounded-card p-5 mb-6">
              <Text className="text-lg font-bold text-ink mb-4 font-rubik text-right">
                זמני טיפול באימות (SLA) - שבועי
              </Text>
              {sla.data.map((row: any, i: number) => (
                <View key={i} className="flex-row justify-between py-2 border-b border-border-light">
                  <Text className="text-ink text-left flex-1 font-bold">
                    {row.avg_days_to_verdict !== null ? `${Number(row.avg_days_to_verdict).toFixed(1)} ימים` : "-"}
                  </Text>
                  <Text className="text-ink-2 text-right flex-1">טופלו: {row.verified}</Text>
                  <Text className="text-ink-2 text-right flex-1">הוגשו: {row.submitted}</Text>
                  <Text className="text-ink text-right flex-1 font-bold">{row.week}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
