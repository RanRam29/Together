import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { MoodBadge } from "@/components/active-match/MoodPicker";
import { InsightsCard } from "@/components/active-match/InsightsCard";
import { PrimaryButton, ScreenShell } from "@/components/ui/Screen";
import { useGetDailyLog } from "@/hooks/useDailyLogs";
import { useMatchMetricKeys, useMetricsForChild } from "@/hooks/useMetrics";
import { useAuthStore } from "@/stores/auth-store";

function formatDate(dateString: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function formatTime(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function DailyLogDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const params = useLocalSearchParams<{ logId?: string; matchId?: string }>();
  const logId = params.logId ?? "";
  const matchId = params.matchId ?? "";

  const isProfessional = profile?.role === "professional";
  const log = useGetDailyLog(logId);
  const matchMetrics = useMatchMetricKeys(matchId || log.data?.match_id);
  const catalog = useMetricsForChild(matchMetrics.data?.childId);

  const metricLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of catalog.data ?? []) {
      map[item.key] = i18n.language === "he" ? item.he_label : item.en_label;
    }
    return map;
  }, [catalog.data, i18n.language]);

  const metricKeys = useMemo(() => {
    const keys = matchMetrics.data?.metricKeys ?? [];
    if (keys.length > 0) return keys;
    return Object.keys(log.data?.metrics ?? {});
  }, [matchMetrics.data?.metricKeys, log.data?.metrics]);

  if (log.isLoading) {
    return (
      <ScreenShell
        eyebrow={t("activeMatch.logEyebrow")}
        title={t("activeMatch.logDetailTitle")}
        showBack
        backFallbackHref="/(active-match)"
      >
        <ActivityIndicator size="large" color="#534AB7" className="mt-8" />
      </ScreenShell>
    );
  }

  if (!log.data) {
    return (
      <ScreenShell
        eyebrow={t("activeMatch.logEyebrow")}
        title={t("activeMatch.logDetailTitle")}
        showBack
        backFallbackHref="/(active-match)"
      >
        <Text className="text-ink-2 text-center mt-8">{t("common.tryAgain")}</Text>
      </ScreenShell>
    );
  }

  const entry = log.data;
  const resolvedMatchId = matchId || entry.match_id;
  const insight = isProfessional ? entry.ai_strategy : entry.ai_summary;
  const insightTitle = isProfessional
    ? t("activeMatch.aiStrategyTitle")
    : t("activeMatch.aiSummaryTitle");

  return (
    <ScreenShell
      eyebrow={t("activeMatch.logEyebrow")}
      title={t("activeMatch.logDetailTitle")}
      showBack
      backFallbackHref="/(active-match)"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-surface border border-border rounded-card p-5 mb-4 flex-row items-center gap-4">
          <MoodBadge value={entry.mood} />
          <View className="flex-1">
            <Text className="text-base font-bold text-ink font-rubik">
              {formatDate(entry.log_date, i18n.language)}
            </Text>
            <Text className="text-sm text-ink-2 mt-1">
              {t("activeMatch.logTimeLabel", {
                time: formatTime(entry.created_at, i18n.language),
              })}
            </Text>
            <Text className="text-sm text-purple font-semibold mt-1 font-rubik">
              {t(`activeMatch.mood${entry.mood}` as "activeMatch.mood1")}
            </Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-purple mb-3 font-rubik">
          {t("activeMatch.metricsSection")}
        </Text>

        {metricKeys.map((key) => (
          <View
            key={key}
            className="bg-surface border border-border rounded-card px-4 py-3 mb-2 flex-row items-center justify-between"
          >
            <Text className="text-sm text-ink flex-1 text-start font-rubik">
              {metricLabels[key] ?? key}
            </Text>
            <Text className="text-base font-bold text-purple font-rubik">
              {entry.metrics?.[key] ?? "—"}
            </Text>
          </View>
        ))}

        {entry.notes ? (
          <View className="bg-surface border border-border rounded-card p-4 mb-4 mt-2">
            <Text className="text-sm font-bold text-purple mb-2 font-rubik">
              {t("activeMatch.notesLabel")}
            </Text>
            <Text className="text-base text-ink leading-6 text-start">{entry.notes}</Text>
          </View>
        ) : null}

        <InsightsCard
          title={insightTitle}
          emptyLabel={t("activeMatch.aiPreparing")}
          content={insight}
          variant={isProfessional ? "teal" : "purple"}
        />

        {isProfessional ? (
          <View className="gap-3 pb-10 mt-2">
            <PrimaryButton
              label={t("activeMatch.editLog")}
              onPress={() =>
                router.push({
                  pathname: "/(active-match)/daily-log-form",
                  params: { matchId: resolvedMatchId, logId: entry.id },
                })
              }
              variant="purple"
            />
            <PrimaryButton
              label={t("activeMatch.addAnotherLog")}
              onPress={() =>
                router.push({
                  pathname: "/(active-match)/daily-log-form",
                  params: { matchId: resolvedMatchId },
                })
              }
              variant="teal"
            />
          </View>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}
