// Sign-in / create-account island (email+password + Google OAuth).
// Sessions are cookie-based (@supabase/ssr) so SSR dashboard routes see them.
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/auth/client";
import { gsap } from "@/lib/gsap";

export interface AuthDict {
  signinTitle: string;
  signinSub: string;
  signupTitle: string;
  signupSub: string;
  email: string;
  password: string;
  passwordHint: string;
  signinCta: string;
  signupCta: string;
  google: string;
  or: string;
  toSignup: string;
  toSignin: string;
  errCredentials: string;
  errExists: string;
  errWeak: string;
  errGeneric: string;
}

export default function AuthForm({ dict, defaultRedirect }: { dict: AuthDict; defaultRedirect: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // ?redirect=/konto — where to land after auth (validated: same-origin path)
  const redirectTo = () => {
    const p = new URLSearchParams(location.search).get("redirect");
    return p && p.startsWith("/") && !p.startsWith("//") ? p : defaultRedirect;
  };

  useEffect(() => {
    // Already signed in → straight to the dashboard.
    supabaseBrowser().auth.getUser().then(({ data }) => {
      if (data.user) location.replace(redirectTo());
    });
  }, []);

  useEffect(() => {
    if (!rootRef.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll(".af-in"),
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 },
    );
  }, []);

  const mapError = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return dict.errCredentials;
    if (m.includes("already registered") || m.includes("already exists")) return dict.errExists;
    if (m.includes("password") && (m.includes("at least") || m.includes("weak"))) return dict.errWeak;
    return dict.errGeneric;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (mode === "signup" && password.length < 8) {
      setError(dict.errWeak);
      return;
    }
    setBusy(true);
    const supabase = supabaseBrowser();
    const { error: err } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (err) {
      setError(mapError(err.message));
      setBusy(false);
      return;
    }
    // Ensure the session cookie is flushed before navigating (avoids a race
    // where the next page's client sees no session).
    await supabase.auth.getSession();
    location.assign(redirectTo());
  };

  const google = async () => {
    setError(null);
    const { error: err } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}${redirectTo()}` },
    });
    if (err) setError(dict.errGeneric);
  };

  const signup = mode === "signup";

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[26rem]">
      <div className="af-in">
        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] font-medium leading-tight text-ink-900 [font-family:var(--font-display)]">
          {signup ? dict.signupTitle : dict.signinTitle}
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
          {signup ? dict.signupSub : dict.signinSub}
        </p>
      </div>

      <button
        type="button"
        onClick={google}
        className="af-in mt-8 flex w-full items-center justify-center gap-3 rounded-[var(--radius-sm)] border border-line-2 px-4 py-3 text-[0.9rem] font-medium text-ink-900 transition-colors hover:border-ink-400"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {dict.google}
      </button>

      <div className="af-in mt-6 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{dict.or}</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="af-in mt-6">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="af-email">
          {dict.email}
        </label>
        <input
          id="af-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.05rem] text-ink-900 outline-none transition-colors focus:border-ink-900"
        />

        <label className="mt-6 block text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="af-password">
          {dict.password}
        </label>
        <input
          id="af-password"
          type="password"
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.05rem] text-ink-900 outline-none transition-colors focus:border-ink-900"
        />
        {signup && <p className="mt-2 text-[0.8rem] text-ink-400">{dict.passwordHint}</p>}

        {error && (
          <p role="alert" className="mt-4 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-3 py-2.5 text-[0.85rem] text-red-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 flex w-full items-center justify-center rounded-[var(--radius-sm)] bg-red px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep disabled:opacity-60"
        >
          {signup ? dict.signupCta : dict.signinCta}
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(signup ? "signin" : "signup"); setError(null); }}
        className="af-in mt-6 w-full text-center text-[0.875rem] text-ink-500 transition-colors hover:text-ink-900"
      >
        {signup ? dict.toSignin : dict.toSignup}
      </button>
    </div>
  );
}
