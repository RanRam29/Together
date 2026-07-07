import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createMatchRequest,
  fetchMatchRequestsForParent,
} from "@/lib/api/matches";

export const matchRequestsQueryKey = (parentId: string) =>
  ["matchRequests", parentId] as const;

export function useMatchRequests(parentId: string | undefined, childIds: string[]) {
  return useQuery({
    queryKey: matchRequestsQueryKey(parentId ?? ""),
    queryFn: () => fetchMatchRequestsForParent(childIds),
    enabled: Boolean(parentId) && childIds.length > 0,
  });
}

export function useCreateMatchRequest(parentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMatchRequest,
    onSuccess: () => {
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: matchRequestsQueryKey(parentId),
        });
      }
    },
  });
}
