import { supabase } from "@/lib/supabase";

export interface AdminUserRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  area: string | null;
  suspended_at: string | null;
  created_at: string;
}

export interface AdminUserLogin {
  email: string | null;
  phone: string | null;
  username: string;
}

export interface AdminUserFilters {
  role?: "parent" | "professional" | "admin" | "supervisor" | "all";
  search?: string;
  suspendedOnly?: boolean;
}

export async function fetchAdminUsers(
  filters: AdminUserFilters = {},
): Promise<AdminUserRow[]> {
  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, role, area, suspended_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters.role && filters.role !== "all") {
    query = query.eq("role", filters.role);
  }
  if (filters.suspendedOnly) {
    query = query.not("suspended_at", "is", null);
  }
  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(
      `full_name.ilike.${term},phone.ilike.${term},area.ilike.${term}`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as AdminUserRow[];
}

export async function fetchAdminUser(
  userId: string,
): Promise<AdminUserRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, area, suspended_at, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as AdminUserRow | null;
}

export async function adminSuspendUser(
  userId: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_suspend_user", {
    p_user_id: userId,
    p_reason: reason.trim(),
  });
  if (error) throw error;
}

export async function adminRestoreUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_restore_user", {
    p_user_id: userId,
  });
  if (error) throw error;
}

export interface AdminNoteRow {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
}

export async function fetchAdminNotes(
  targetUserId: string,
): Promise<AdminNoteRow[]> {
  const { data, error } = await supabase
    .from("admin_notes" as "audit_log")
    .select("id, note, created_at, created_by")
    .eq("target_user_id" as "resource_id", targetUserId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.warn("[admin] notes unavailable:", error.message);
    return [];
  }
  return (data ?? []) as unknown as AdminNoteRow[];
}

export async function fetchAdminUserLogin(
  userId: string,
): Promise<AdminUserLogin | null> {
  const { data, error } = await supabase.rpc("admin_get_user_login", {
    p_user_id: userId,
  });
  if (error) throw error;
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  return {
    email: typeof row.email === "string" ? row.email : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    username:
      typeof row.username === "string" && row.username.trim()
        ? row.username
        : userId,
  };
}

export async function adminSetUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_set_user_password", {
    p_user_id: userId,
    p_password: password,
  });
  if (error) throw error;
}
