/** Detect Supabase/PostgREST unique-constraint violations (HTTP 409). */
export function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: string; message?: string; status?: number };
  return (
    record.code === "23505" ||
    record.status === 409 ||
    (typeof record.message === "string" &&
      record.message.toLowerCase().includes("duplicate key"))
  );
}
