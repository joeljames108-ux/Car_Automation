import { createClient } from "@supabase/supabase-js";

const url = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || "https://placeholder.supabase.co";
const anonKey = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
  import.meta.env?.VITE_SUPABASE_URL &&
  import.meta.env?.VITE_SUPABASE_ANON_KEY &&
  url !== "https://placeholder.supabase.co" &&
  anonKey !== "placeholder-anon-key"
);

export const supabase = createClient(url, anonKey);

