import type { MatchRequest, TablesInsert } from "@toghther/shared";

import { supabase } from "@/lib/supabase";
import type { ChildMatch } from "@/lib/types";

export async function getMatchesForChild(
  childId: string,
  limit = 5,
): Promise<ChildMatch[]> {
  const { data, error } = await supabase.rpc("get_matches_for_child", {
    p_child_id: childId,
    p_limit: limit,
  });

  if (error) throw error;
  return data ?? [];
}

export async function fetchMatchRequestsForParent(
  childIds: string[],
): Promise<MatchRequest[]> {
  if (childIds.length === 0) return [];

  const { data, error } = await supabase
    .from("match_requests")
    .select("*")
    .in("child_id", childIds)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createMatchRequest(
  input: Pick<
    TablesInsert<"match_requests">,
    | "child_id"
    | "professional_id"
    | "parent_message"
    | "score"
    | "match_reason"
  >,
): Promise<MatchRequest> {
  const { data, error } = await supabase
    .from("match_requests")
    .insert({
      ...input,
      initiated_by: "parent",
      tier_reached: 1,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
