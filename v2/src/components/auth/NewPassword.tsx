// New-password island (/passwort). The recovery email link carries a code the
// browser client exchanges for a session automatically; we then just call
// updateUser. Invalid/expired links show a clear way back.
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/auth/client";

export interface NewPasswordDict {
  title: string;
  sub: string;
  newPassword: string;
  passwordHint: string;
  save: string;
  errLink: string;
  errSave: string;
  errWeak: string;
  back: string;
}

export default function NewPassword({ dict, kontoHref, loginHref }: { dict: NewPasswordDict; kontoHref: string; loginHref: string }) {
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();

    // Two link styles reach this page: PKCE (?code=…, auto-exchanged by the
    // client) and implicit (#access_token=…, e.g. link opened on another
    // device than the one that requested it). Handle the hash explicitly.
    const hash = new URLSearchParams(location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    if (accessToken && refreshToken) {
      void sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
        if (!error) history.replaceState(null, "", location.pathname); // strip tokens from the URL
      });
    }

    let tries = 0;
    const check = async () => {
      const { data } = await sb.auth.getSession();
      if (data.session) { setReady("ok"); return; }
      if (++tries > 10) { setReady("invalid"); return; }
      setTimeout(check, 400);
    };
    void check();
    const { data: sub } = sb.auth.onAuthStateChange((_evt, session) => {
      if (session) setReady("ok");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (password.length < 8) { setError(dict.errWeak); return; }
    setBusy(true);
    const { error: err } = await supabaseBrowser().auth.updateUser({ password });
    if (err) {
      setError(dict.errSave);
      setBusy(false);
      return;
    }
    location.assign(kontoHref);
  };

  if (ready === "checking") {
    return <div className="py-32 text-center text-[0.9rem] text-ink-400 [font-family:var(--font-mono)]">…</div>;
  }

  if (ready === "invalid") {
    return (
      <div className="mx-auto w-full max-w-[26rem] text-center">
        <p className="rounded-[var(--radius-sm)] border border-line-2 bg-paper-2 px-4 py-4 text-[0.9rem] leading-relaxed text-ink-700">{dict.errLink}</p>
        <a href={loginHref} className="mt-6 inline-block text-[0.875rem] text-ink-500 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink-900">
          {dict.back}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[26rem]">
      <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] font-medium leading-tight text-ink-900 [font-family:var(--font-display)]">{dict.title}</h1>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">{dict.sub}</p>

      <form onSubmit={submit} className="mt-8">
        <label className="block text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]" htmlFor="np-password">
          {dict.newPassword}
        </label>
        <input
          id="np-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.05rem] text-ink-900 outline-none transition-colors focus:border-ink-900"
        />
        <p className="mt-2 text-[0.8rem] text-ink-400">{dict.passwordHint}</p>

        {error && (
          <p role="alert" className="mt-4 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-3 py-2.5 text-[0.85rem] text-red-deep">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-8 flex w-full items-center justify-center rounded-[var(--radius-sm)] bg-red px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep disabled:opacity-60"
        >
          {busy ? "…" : dict.save}
        </button>
      </form>
    </div>
  );
}
