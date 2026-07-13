import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { getCorsHeaders } from "../_shared/cors.ts";

interface MatchRequest {
  child_id: string;
  limit?: number;
}

export default {
  fetch: withSupabase({ auth: ["publishable", "authenticated"] }, async (req, ctx) => {
    const cors = getCorsHeaders(req);

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: cors });
    }

    try {
      const { child_id, limit = 5 } = await req.json() as MatchRequest;

      if (!child_id) {
        return Response.json(
          { error: "child_id is required" },
          { status: 400, headers: cors }
        );
      }

      const { data: matches, error: dbError } = await ctx.supabase.rpc(
        "get_matches_for_child",
        {
          p_child_id: child_id,
          p_limit: limit,
        }
      );

      if (dbError) {
        console.error("Database query error:", dbError);
        return Response.json(
          { error: dbError.message },
          { status: 500, headers: cors }
        );
      }

      if (!matches || matches.length === 0) {
        return Response.json({ matches: [] }, { headers: cors });
      }

      return Response.json({ matches }, { headers: cors });

    } catch (err: any) {
      console.error("Edge Function unexpected error:", err);
      return Response.json(
        { error: err.message },
        { status: 500, headers: cors }
      );
    }
  }),
};
