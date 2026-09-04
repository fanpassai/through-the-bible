import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured, supabasePublishableKey, supabaseUrl } from "./config";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return supabaseConfigured;
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl,
      supabasePublishableKey,
    );
  }
  return browserClient;
}
