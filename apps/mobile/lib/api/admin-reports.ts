import { supabase } from "../supabase";

export async function fetchAdminReportOverview() {
  const { data, error } = await supabase.rpc("admin_report_overview");
  if (error) throw error;
  return data as any;
}

export async function fetchAdminReportTimeseries(metric: string, fromDate: string, toDate: string) {
  const { data, error } = await supabase.rpc("admin_report_timeseries", {
    p_metric: metric,
    p_from: fromDate,
    p_to: toDate,
  });
  if (error) throw error;
  return data as { bucket: string; value: number }[];
}

export async function fetchAdminReportFunnel(fromDate: string, toDate: string) {
  const { data, error } = await supabase.rpc("admin_report_funnel", {
    p_from: fromDate,
    p_to: toDate,
  });
  if (error) throw error;
  return data as any;
}

export async function fetchAdminReportVerificationSla() {
  const { data, error } = await supabase.rpc("admin_report_verification_sla");
  if (error) throw error;
  return data as { week: string; submitted: number; verified: number; avg_days_to_verdict: number }[];
}
