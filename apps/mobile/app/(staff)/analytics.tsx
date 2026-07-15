import { RefreshControl, ScrollView, Text, View, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";

import { StaffQueryFeedback } from "@/components/admin/StaffQueryFeedback";
import {
  useAdminReportFunnel,
  useAdminReportOverview,
  useAdminReportTimeseries,
  useAdminReportVerificationSla,
} from "@/hooks/useAdminReports";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { useAdminMfa } from "@/hooks/useAdminMfa";
import { BrandSpinner } from "@/components/motion/BrandSpinner";
import { colors } from "@/lib/theme";

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const METRICS = [
  { id: "new_users", label: "משתמשים חדשים" },
  { id: "new_children_published", label: "ילדים שפורסמו" },
  { id: "new_requests", label: "בקשות חדשות" },
  { id: "new_matches", label: "התאמות חדשות" },
  { id: "ended_matches", label: "התאמות שהסתיימו" },
  { id: "daily_logs", label: "דיווחי יומן" },
  { id: "checkins", label: "נוכחות" },
  { id: "day_offs", label: "ימי חופשה" },
];

const RANGES = [
  { id: "7d", label: "7 ימים", days: 7 },
  { id: "30d", label: "30 ימים", days: 30 },
  { id: "90d", label: "3 חודשים", days: 90 },
];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { isReady, isAdmin } = useStaffRoute();
  const mfa = useAdminMfa(isAdmin);
  
  const [metric, setMetric] = useState("new_users");
  const [range, setRange] = useState(30);

  const { fromDate, toDate } = useMemo(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - range);
    return { fromDate: formatDate(start), toDate: formatDate(today) };
  }, [range]);

  const overview = useAdminReportOverview();
  const funnel = useAdminReportFunnel(fromDate, toDate);
  const timeseries = useAdminReportTimeseries(metric, fromDate, toDate);
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
        <BrandSpinner size="large" />
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
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh}
          tintColor={colors.purple}
          colors={[colors.purple]}
        />}
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

          <View className="mt-2 bg-surface border border-border rounded-card p-5 mb-6">
            <Text className="text-lg font-bold text-ink mb-4 font-rubik text-right">
              גרף נתונים (Timeseries)
            </Text>
            
            <View className="mb-4">
              <Text className="text-sm font-semibold text-ink-2 mb-2 text-right">בחר מדד:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                {METRICS.map(m => (
                  <Pressable
                    key={m.id}
                    onPress={() => setMetric(m.id)}
                    className={`px-4 py-2 rounded-full border ${metric === m.id ? 'bg-purple border-purple' : 'bg-white border-border'}`}
                  >
                    <Text className={`font-semibold ${metric === m.id ? 'text-white' : 'text-ink-2'}`}>{m.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-ink-2 mb-2 text-right">בחר טווח:</Text>
              <View className="flex-row gap-2 justify-end">
                {RANGES.map(r => (
                  <Pressable
                    key={r.id}
                    onPress={() => setRange(r.days)}
                    className={`px-4 py-2 rounded-lg border ${range === r.days ? 'bg-teal border-teal' : 'bg-white border-border'}`}
                  >
                    <Text className={`font-semibold ${range === r.days ? 'text-white' : 'text-ink-2'}`}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {timeseries.data && timeseries.data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                <View className="flex-row items-end h-40 gap-1 border-b border-border w-max min-w-[300px]">
                  {(() => {
                    const maxVal = Math.max(...timeseries.data.map((d: any) => d.value), 5);
                    return timeseries.data.map((d: any, i: number) => {
                      const hPct = Math.max((d.value / maxVal) * 100, 2);
                      const isWeekend = new Date(d.bucket).getDay() === 5 || new Date(d.bucket).getDay() === 6;
                      return (
                        <View key={i} className="items-center" style={{ width: 24 }}>
                          <View className="w-4 rounded-t-sm bg-purple" style={{ height: `${hPct}%`, opacity: isWeekend ? 0.6 : 1 }} />
                          <Text className="text-[9px] text-ink-2 mt-1 -rotate-45" numberOfLines={1}>{new Date(d.bucket).getDate()}</Text>
                        </View>
                      );
                    });
                  })()}
                </View>
              </ScrollView>
            ) : (
              <Text className="text-center text-ink-2 my-4">לא נמצאו נתונים לטווח זה</Text>
            )}
          </View>

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
