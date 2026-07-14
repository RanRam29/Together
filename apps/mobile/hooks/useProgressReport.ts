import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ProgressReportData {
  report_version: number;
  child_id: string;
  period: {
    from: string;
    to: string;
    total_days: number;
  };
  metrics: {
    days_attended: number;
    days_off: number;
    total_logs: number;
    avg_mood: number | null;
  };
  weekly_trends: Array<{
    week_start: string;
    avg_mood: number | null;
    metrics_avg: Record<string, number>;
  }>;
  matches_breakdown: Array<{
    professional_name: string;
    started_at: string;
    ended_at: string | null;
    days_attended: number;
  }>;
}

export function useProgressReport(childId: string | undefined, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ["progress_report", childId, fromDate, toDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_child_progress_report" as any, {
        p_child_id: childId!,
        p_from: fromDate,
        p_to: toDate,
      });

      if (error) throw new Error(error.message);
      return data as unknown as ProgressReportData;
    },
    enabled: Boolean(childId && fromDate && toDate),
  });
}
