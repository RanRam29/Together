import { useQuery } from "@tanstack/react-query";

import { getMatchesForChild } from "@/lib/api/matches";

export const matchesQueryKey = (childId: string) => ["matches", childId] as const;

export function useChildMatches(childId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: [...matchesQueryKey(childId ?? ""), limit],
    queryFn: () => getMatchesForChild(childId!, limit),
    enabled: Boolean(childId),
  });
}
