// Public Supabase connection values. These are CLIENT-SIDE by design (they
// ship in every browser bundle; security lives in RLS, not in hiding these).
// Env vars override when present; the fallbacks keep every deploy target
// working without env configuration.
export const SUPABASE_URL: string =
  import.meta.env.PUBLIC_SUPABASE_URL ?? "https://zogxrzwfmpeitktdvwnk.supabase.co";

export const SUPABASE_ANON_KEY: string =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZ3hyendmbXBlaXRrdGR2d25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODk3NTksImV4cCI6MjA5NTI2NTc1OX0.ztz2kAlgosIHGC6AMIYeWVHfg5GC8XYCdJx_n1l8uYM";
