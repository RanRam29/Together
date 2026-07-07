import type { Child, TablesInsert, TablesUpdate } from "@toghther/shared";

import { supabase } from "@/lib/supabase";

export async function fetchChildren(parentId: string): Promise<Child[]> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createChild(
  input: TablesInsert<"children">,
): Promise<Child> {
  const { data, error } = await supabase
    .from("children")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChild(
  id: string,
  input: TablesUpdate<"children">,
): Promise<Child> {
  const { data, error } = await supabase
    .from("children")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
