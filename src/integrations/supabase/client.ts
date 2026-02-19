import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ajpaszvgnfmvkfitkaox.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqcGFzenZnbmZtdmtmaXRrYW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzOTQ5MjgsImV4cCI6MjA4Njk3MDkyOH0.50g4GZTmZ2Mbbw2tyRN_OxNFmKi5cQGtDvHjKjkoEWU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
