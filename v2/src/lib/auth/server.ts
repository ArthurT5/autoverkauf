// Server-side Supabase client bound to the request's cookies (SSR routes
// only — dashboard pages set `export const prerender = false`).
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

export function supabaseServer(request: Request, cookies: AstroCookies): SupabaseClient {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie") ?? "").map((c) => ({
            name: c.name,
            value: c.value ?? "",
          }));
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookies.set(name, value, { ...options, path: "/" });
          }
        },
      },
    },
  );
}

/** Authenticated user for an SSR request, or null. */
export async function requestUser(
  request: Request,
  cookies: AstroCookies,
): Promise<{ supabase: SupabaseClient; user: User | null }> {
  const supabase = supabaseServer(request, cookies);
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user ?? null };
}
