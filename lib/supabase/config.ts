// Supabase publishable configuration is intentionally safe for browser bundles.
// Environment variables remain the first choice; the fallback keeps review
// deployments connected when Vercel scopes those variables to Production only.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  || "https://wfewmxjienglyicbyfrq.supabase.co";

export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || "sb_publishable_L9QMT20oEX1UNAbiQtHN3g_0O_Osd9j";

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
