import { useQuery } from "@tanstack/react-query";

import {
  fetchAuditFilterOptions,
  fetchAuditLog,
  type AuditLogFilters,
} from "@/lib/api/admin-audit";

export const adminAuditKey = (filters: AuditLogFilters) =>
  ["admin", "audit", filters] as const;

export function useAdminAudit(filters: AuditLogFilters) {
  return useQuery({
    queryKey: adminAuditKey(filters),
    queryFn: () => fetchAuditLog(filters),
  });
}

export function useAuditFilterOptions() {
  return useQuery({
    queryKey: ["admin", "audit", "filter-options"] as const,
    queryFn: fetchAuditFilterOptions,
    staleTime: 5 * 60 * 1000,
  });
}
