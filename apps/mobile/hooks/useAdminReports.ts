import { useQuery } from "@tanstack/react-query";
import {
  fetchAdminReportFunnel,
  fetchAdminReportOverview,
  fetchAdminReportTimeseries,
  fetchAdminReportVerificationSla,
} from "@/lib/api/admin-reports";

export const adminReportOverviewKey = ["admin", "report-overview"] as const;
export const adminReportTimeseriesKey = (metric: string, fromDate: string, toDate: string) => ["admin", "report-timeseries", metric, fromDate, toDate] as const;
export const adminReportFunnelKey = (fromDate: string, toDate: string) => ["admin", "report-funnel", fromDate, toDate] as const;
export const adminReportSlaKey = ["admin", "report-sla"] as const;

export function useAdminReportOverview() {
  return useQuery({
    queryKey: adminReportOverviewKey,
    queryFn: fetchAdminReportOverview,
    refetchInterval: 120_000,
  });
}

export function useAdminReportTimeseries(metric: string, fromDate: string, toDate: string) {
  return useQuery({
    queryKey: adminReportTimeseriesKey(metric, fromDate, toDate),
    queryFn: () => fetchAdminReportTimeseries(metric, fromDate, toDate),
    refetchInterval: 120_000,
  });
}

export function useAdminReportFunnel(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: adminReportFunnelKey(fromDate, toDate),
    queryFn: () => fetchAdminReportFunnel(fromDate, toDate),
    refetchInterval: 120_000,
  });
}

export function useAdminReportVerificationSla() {
  return useQuery({
    queryKey: adminReportSlaKey,
    queryFn: fetchAdminReportVerificationSla,
    refetchInterval: 120_000,
  });
}
