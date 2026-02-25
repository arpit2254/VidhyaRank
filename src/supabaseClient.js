import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// 👉 PASTE YOUR SUPABASE VALUES HERE
//    Dashboard → your project → Settings → API
// ─────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://mzeevcirqtsfoezmbsxl.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16ZWV2Y2lycXRzZm9lem1ic3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjQ0MDksImV4cCI6MjA4NzU0MDQwOX0.Fcldh_Gdto5FoWD17rc9REnWO9kTaYRZDLB-yjzbPZE";
// ─────────────────────────────────────────────────────────────────────────────

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes("YOUR_PROJECT_ID") &&
  !SUPABASE_ANON.includes("YOUR_ANON_PUBLIC_KEY");

export const supabase = createClient(
  SUPABASE_CONFIGURED ? SUPABASE_URL  : "https://placeholder.supabase.co",
  SUPABASE_CONFIGURED ? SUPABASE_ANON : "placeholder-key"
);
