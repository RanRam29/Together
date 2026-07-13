export const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = (Deno.env.get("CORS_ORIGINS") || "*").split(",").map(s => s.trim());
  
  let allowOrigin = "";
  if (allowedOrigins.includes("*")) {
    allowOrigin = "*";
  } else if (allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else {
    allowOrigin = allowedOrigins[0] || ""; // Fallback or strict denial
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
};
