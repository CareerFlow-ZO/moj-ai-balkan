const SUPABASE_URL = "https://tlfwivvpbrewbiawgymi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_w4HTuQvOGf-Xbq0abEwwWg_tn6aoLhq";

window.sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
