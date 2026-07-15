import { useEffect, useMemo, useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { Pressable, ScrollView, Text, View } from "react-native";



import { MetricStepper } from "@/components/active-match/MetricStepper";

import { MoodPicker } from "@/components/active-match/MoodPicker";

import { PrimaryButton, ScreenShell, TextField } from "@/components/ui/Screen";

import { useGetDailyLog, useSubmitDailyLog } from "@/hooks/useDailyLogs";

import { useMatchMetricKeys, useMetricsForChild } from "@/hooks/useMetrics";

import { errorMessage, showError, showSuccess } from "@/lib/feedback";



function retroDateOptions(): { label: string; value: string }[] {

  const options: { label: string; value: string }[] = [];

  const now = new Date();

  for (let i = 0; i < 3; i++) {

    const d = new Date(now);

    d.setDate(d.getDate() - i);

    const value = d.toISOString().split("T")[0];

    const label =

      i === 0

        ? "היום"

        : new Intl.DateTimeFormat("he", { weekday: "short", day: "numeric", month: "short" }).format(d);

    options.push({ label, value });

  }

  return options;

}



export default function DailyLogFormScreen() {

  const { t, i18n } = useTranslation();

  const router = useRouter();

  const params = useLocalSearchParams<{ matchId?: string; logId?: string }>();

  const matchId = params.matchId ?? "";

  const logId = params.logId ?? "";

  const isEditing = Boolean(logId);



  const existingLog = useGetDailyLog(logId);

  const submit = useSubmitDailyLog(matchId, logId || undefined);

  const matchMetrics = useMatchMetricKeys(matchId);

  const catalog = useMetricsForChild(matchMetrics.data?.childId);



  const [mood, setMood] = useState(3);

  const [metrics, setMetrics] = useState<Record<string, number>>({});

  const [notes, setNotes] = useState("");

  const [highlight, setHighlight] = useState("");

  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);

  const [startedAt] = useState(Date.now());

  const [hydrated, setHydrated] = useState(!isEditing);



  const metricKeys = useMemo(() => {

    const keys = matchMetrics.data?.metricKeys ?? [];

    if (keys.length > 0) return keys;

    return (catalog.data ?? []).slice(0, 3).map((m) => m.key);

  }, [matchMetrics.data?.metricKeys, catalog.data]);



  const metricLabels = useMemo(() => {

    const map: Record<string, string> = {};

    for (const item of catalog.data ?? []) {

      map[item.key] = i18n.language === "he" ? item.he_label : item.en_label;

    }

    return map;

  }, [catalog.data, i18n.language]);



  useEffect(() => {

    if (!isEditing || !existingLog.data || hydrated) return;



    const entry = existingLog.data;

    setMood(entry.mood);

    setMetrics((entry.metrics ?? {}) as Record<string, number>);

    setNotes(entry.notes ?? "");

    setHighlight(entry.highlight ?? "");

    setLogDate(entry.log_date);

    setHydrated(true);

  }, [isEditing, existingLog.data, hydrated]);



  useEffect(() => {

    if (metricKeys.length === 0) return;

    setMetrics((prev) => {

      const next = { ...prev };

      for (const key of metricKeys) {

        if (next[key] === undefined) next[key] = 3;

      }

      return next;

    });

  }, [metricKeys]);



  function updateMetric(key: string, value: number) {

    setMetrics((prev) => ({ ...prev, [key]: value }));

  }



  async function handleSubmit() {

    if (!matchId) {

      showError(t("activeMatch.noMatchSelected"));

      return;

    }



    const secondsToComplete = Math.round((Date.now() - startedAt) / 1000);



    try {

      await submit.submitLog({

        mood,

        metrics,

        notes: notes.trim(),

        highlight: highlight.trim() || undefined,

        log_date: logDate,

        seconds_to_complete: secondsToComplete,

      });

      showSuccess({

        title: isEditing ? t("activeMatch.logUpdated") : t("activeMatch.logSaved"),

        footnote: t("activeMatch.logSavedRedirecting"),

        iconColor: "#534AB7",

        onDismiss: () => router.back(),

      });

    } catch (err) {

      showError(errorMessage(err, t("common.tryAgain")));

    }

  }



  const dateOptions = retroDateOptions();



  return (

    <ScreenShell

      eyebrow={t("activeMatch.logEyebrow")}

      title={isEditing ? t("activeMatch.logFormEditTitle") : t("activeMatch.logFormTitle")}

      subtitle={t("activeMatch.logFormSubtitle")}

      showBack

      backFallbackHref="/(active-match)"

    >

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <Text className="text-sm font-bold text-purple mb-2 font-rubik">

          {t("activeMatch.logDateLabel")}

        </Text>

        {isEditing ? (

          <View className="bg-surface border border-border rounded-card px-4 py-3 mb-4">

            <Text className="text-sm text-ink font-rubik">

              {new Intl.DateTimeFormat(i18n.language, {

                weekday: "long",

                day: "numeric",

                month: "long",

              }).format(new Date(logDate))}

            </Text>

          </View>

        ) : (

          <View className="flex-row flex-wrap gap-2 mb-4 justify-end">

            {dateOptions.map((opt) => (

              <Pressable

                key={opt.value}

                onPress={() => setLogDate(opt.value)}

                className={`rounded-full px-4 py-2 border ${

                  logDate === opt.value

                    ? "bg-purple border-purple"

                    : "bg-surface border-border"

                }`}

              >

                <Text

                  className={`text-sm font-semibold font-rubik ${

                    logDate === opt.value ? "text-white" : "text-ink"

                  }`}

                >

                  {opt.label}

                </Text>

              </Pressable>

            ))}

          </View>

        )}



        <MoodPicker

          label={t("activeMatch.moodLabel")}

          value={mood}

          onChange={setMood}

          renderLabel={(key) => t(key)}

        />



        <Text className="text-sm font-bold text-purple mb-3 mt-2 font-rubik">

          {t("activeMatch.metricsSection")}

        </Text>



        {metricKeys.map((key) => (

          <MetricStepper

            key={key}

            label={metricLabels[key] ?? key}

            description=""

            value={metrics[key] ?? 3}

            min={1}

            max={5}

            onChange={(value) => updateMetric(key, value)}

          />

        ))}



        <TextField

          label={t("activeMatch.notesLabel")}

          placeholder={t("activeMatch.notesPlaceholder")}

          value={notes}

          onChangeText={setNotes}

          multiline

          numberOfLines={5}

          className="min-h-[140px]"

          textAlignVertical="top"

        />

        <TextField

          label="רגע היום (רשות)"

          placeholder="רגע קטן ששווה לספר עליו מהיום..."

          value={highlight}

          onChangeText={setHighlight}

          multiline

          maxLength={140}

          numberOfLines={3}

          className="min-h-[80px] mt-4"

          textAlignVertical="top"

        />



        <View className="pb-10 mt-2">

          <PrimaryButton

            label={isEditing ? t("activeMatch.saveLogChanges") : t("activeMatch.submitLog")}

            onPress={handleSubmit}

            loading={submit.isPending || (isEditing && existingLog.isLoading)}

            variant="purple"

          />

        </View>

      </ScrollView>

    </ScreenShell>

  );

}

