import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { supabase } from "@/lib/supabase";

export interface DailyLog {
  id: string;
  match_id: string;
  log_date: string;
  mood: number;
  metrics: Record<string, number>;
  notes: string;
  ai_summary: string | null;
  ai_strategy: string | null;
  created_at: string;
}

export interface DailyLogInput {
  mood: number;
  metrics: Record<string, number>;
  notes: string;
  log_date?: string;
  seconds_to_complete?: number;
}

export function useGetDailyLogs(matchId: string) {
  return useQuery({
    queryKey: ["daily_logs", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("match_id", matchId)
        .order("log_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as DailyLog[];
    },
    enabled: Boolean(matchId),
  });
}

export function useGetDailyLog(logId: string) {
  return useQuery({
    queryKey: ["daily_log", logId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as DailyLog;
    },
    enabled: Boolean(logId),
  });
}

function invalidateDailyLogQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  matchId: string,
  logId?: string,
) {
  queryClient.invalidateQueries({ queryKey: ["daily_logs", matchId] });
  if (logId) {
    queryClient.invalidateQueries({ queryKey: ["daily_log", logId] });
  }
}

export function useSubmitDailyLog(matchId: string, logId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (logData: DailyLogInput) => {
      const todayDate = logData.log_date ?? new Date().toISOString().split("T")[0];
      const payload = {
        match_id: matchId,
        log_date: todayDate,
        mood: logData.mood,
        metrics: logData.metrics,
        notes: logData.notes,
      };

      if (logId) {
        const { data, error } = await supabase
          .from("daily_logs")
          .update(payload)
          .eq("id", logId)
          .eq("match_id", matchId)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data as DailyLog;
      }

      const { data, error } = await supabase
        .from("daily_logs")
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as DailyLog;
    },
    onSuccess: (data, variables) => {
      void track(AnalyticsEvents.DAILY_LOG_SUBMITTED, {
        match_id: matchId,
        seconds_to_complete: variables.seconds_to_complete ?? 0,
      });
      invalidateDailyLogQueries(queryClient, matchId, data.id);
    },
  });

  return {
    submitLog: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
