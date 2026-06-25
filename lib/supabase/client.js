"use client";

import { createBrowserClient } from "@supabase/ssr";

// ~400 days — the max a browser will honor for a cookie. Combined with
// Supabase's auto-refreshing tokens, this keeps the user signed in across
// visits and browser restarts until they explicitly sign out.
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: true,
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}
