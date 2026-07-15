import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface WeeklySummary {
  days_attended: number;
  days_off: number;
  mood_avg: number;
  mood_trend: "no_data" | "new" | "improving" | "declining" | "stable";
  metrics_avg: Record<string, number>;
  highlights: string[];
}

export function useWeeklySummary(matchId: string | undefined, weekStart: string | undefined) {
  return useQuery({
    queryKey: ["weekly_summary", matchId, weekStart],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_summary" as any, {
        p_match_id: matchId,
        p_week_start: weekStart,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as WeeklySummary;
    },
    enabled: Boolean(matchId && weekStart),
  });
}
