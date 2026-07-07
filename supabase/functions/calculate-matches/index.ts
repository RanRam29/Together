import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

// Standard CORS headers for mobile clients
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MatchRequest {
  child_id: string;
  limit?: number;
}

export default {
  fetch: withSupabase({ auth: ["publishable"] }, async (req, ctx) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const { child_id, limit = 5 } = await req.json() as MatchRequest;

      if (!child_id) {
        return Response.json(
          { error: "child_id is required" },
          { status: 400, headers: corsHeaders }
        );
      }

      // Query database using the user's context (respects RLS)
      // Calls our Postgres function get_matches_for_child
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
          { status: 500, headers: corsHeaders }
        );
      }

      // If no matches found, return empty array immediately
      if (!matches || matches.length === 0) {
        return Response.json({ matches: [] }, { headers: corsHeaders });
      }

      // Check if Claude API is configured for advanced matching explanations
      const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
      if (claudeApiKey) {
        try {
          // Fetch child needs details to feed into Claude for personalized descriptions
          const { data: child, error: childError } = await ctx.supabase
            .from("children")
            .select("first_name, category, needs, framework")
            .eq("id", child_id)
            .single();

          if (!childError && child) {
            // Enrich match reasons for each candidate using Claude API
            const enrichedMatches = await Promise.all(
              matches.map(async (match: any) => {
                const prompt = `את/ה יועץ/ת שילוב מקצועי המנסה לעזור להורים למצוא משלבת מתאימה לילדם. 
הילד: ${child.first_name}, אבחנה: ${child.category}, מסגרת: ${child.framework}, צרכים מיוחדים: ${JSON.stringify(child.needs)}.
המשלבת: ${match.display_name}, ניסיון: ${match.experience_years} שנים, דירוג: ${match.rating_avg}/5, התמחויות: ${match.specialties.join(", ")}, ביוגרפיה מקצועית: ${match.bio}.
המרחק הגיאוגרפי ביניהם: ${match.distance_km} ק"מ.

כתוב/כתבי 2-3 משפטים בעברית חמה, מקצועית ומעודדת המסבירים להורה למה משלבת זו מתאימה לילדו על בסיס הנתונים הללו (למשל, שילוב של הניסיון שלה, הקרבה הגיאוגרפית או תת-התמחות רלוונטית). התחל/התחילי ישירות בהסבר ללא הקדמות.`;

                const response = await fetch("https://api.anthropic.com/v1/messages", {
                  method: "POST",
                  headers: {
                    "x-api-key": claudeApiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "claude-3-5-sonnet-latest",
                    max_tokens: 256,
                    messages: [{ role: "user", content: prompt }],
                  }),
                });

                if (response.ok) {
                  const result = await response.json();
                  const content = result.content?.[0]?.text;
                  if (content) {
                    return {
                      ...match,
                      match_reason: content.trim(),
                    };
                  }
                }
                
                // Fallback to database summary if Claude API fails or times out
                return match;
              })
            );

            return Response.json({ matches: enrichedMatches }, { headers: corsHeaders });
          }
        } catch (aiError) {
          console.error("AI enrichment failed, falling back to DB summary:", aiError);
        }
      }

      // Fallback: return matches directly with DB-generated match_reason
      return Response.json({ matches }, { headers: corsHeaders });

    } catch (err: any) {
      console.error("Edge Function unexpected error:", err);
      return Response.json(
        { error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  }),
};
