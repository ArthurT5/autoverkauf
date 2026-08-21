// Dealer application island (/haendler/apply). Creates the account inline if
// needed, then files the application — approval is manual (the vetting behind
// "verified Swiss dealers").
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/auth/client";
import { CANTONS } from "@/lib/cantons";

export interface DealerApplyDict {
  title: string;
  sub: string;
  company: string;
  uid: string;
  contact: string;
  email: string;
  password: string;
  passwordHint: string;
  phone: string;
  canton: string;
  autoscout: string;
  note: string;
  optional: string;
  submit: string;
  doneTitle: string;
  doneSub: string;
  err: string;
  errExists: string;
  dashboard: string;
}

export default function DealerApply({ dict, lang, kontoHref }: { dict: DealerApplyDict; lang: string; kontoHref: string }) {
  const [signedIn, setSignedIn] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "", uid: "", contact: "", email: "", password: "",
    phone: "", canton: "", autoscout: "", note: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabaseBrowser().auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setSignedIn(data.user.email);
        setForm((f) => ({ ...f, email: data.user!.email! }));
      }
    });
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const cantonLabel = (c: (typeof CANTONS)[number]) =>
    c[(lang === "en" ? "de" : lang) as "de" | "fr" | "it"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const sb = supabaseBrowser();
    try {
      let userId: string;
      if (signedIn) {
        const { data } = await sb.auth.getUser();
        userId = data.user!.id;
      } else {
        const { data, error: err } = await sb.auth.signUp({ email: form.email.trim(), password: form.password });
        if (err) {
          if (/already|exists/i.test(err.message)) {
            const retry = await sb.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
            if (retry.error || !retry.data.user) throw new Error("exists");
            userId = retry.data.user.id;
          } else {
            throw new Error("generic");
          }
        } else {
          if (!data.user) throw new Error("generic");
          userId = data.user.id;
        }
      }
      const { error: insErr } = await sb.from("dealer_applications").insert({
        user_id: userId!,
        company_name: form.company.trim(),
        uid: form.uid.trim() || null,
        contact_name: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        canton: form.canton || null,
        autoscout_dealer_url: form.autoscout.trim() || null,
        note: form.note.trim() || null,
      });
      if (insErr) throw new Error("generic");
      setDone(true);
    } catch (err) {
      setError((err as Error).message === "exists" ? dict.errExists : dict.err);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-[30rem] flex-col items-center py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-red text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h1 className="mt-6 text-[clamp(1.8rem,4vw,2.4rem)] font-medium text-ink-900 [font-family:var(--font-display)]">{dict.doneTitle}</h1>
        <p className="mt-3 max-w-[26rem] text-[0.95rem] leading-relaxed text-ink-500">{dict.doneSub}</p>
        <a href={kontoHref} className="mt-8 inline-flex items-center rounded-[var(--radius-sm)] bg-red px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep">
          {dict.dashboard}
        </a>
      </div>
    );
  }

  const field = "mt-2 w-full border-b border-line-2 bg-transparent pb-2 text-[1.05rem] text-ink-900 outline-none transition-colors focus:border-ink-900";
  const label = "mt-7 block text-[11px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]";

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-medium leading-tight text-ink-900 [font-family:var(--font-display)]">{dict.title}</h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-500">{dict.sub}</p>

      <form onSubmit={submit} className="mt-6">
        <label className={label} htmlFor="da-company">{dict.company}</label>
        <input id="da-company" required value={form.company} onChange={set("company")} className={field} />

        <label className={label} htmlFor="da-uid">{dict.uid} <span className="normal-case text-ink-400/70">· {dict.optional}</span></label>
        <input id="da-uid" value={form.uid} onChange={set("uid")} placeholder="CHE-123.456.789" className={field} />

        <label className={label} htmlFor="da-contact">{dict.contact}</label>
        <input id="da-contact" required value={form.contact} onChange={set("contact")} className={field} />

        <label className={label} htmlFor="da-email">{dict.email}</label>
        <input id="da-email" type="email" required value={form.email} onChange={set("email")} disabled={!!signedIn} className={`${field} disabled:text-ink-400`} />

        {!signedIn && (
          <>
            <label className={label} htmlFor="da-password">{dict.password}</label>
            <input id="da-password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} className={field} />
            <p className="mt-2 text-[0.8rem] text-ink-400">{dict.passwordHint}</p>
          </>
        )}

        <label className={label} htmlFor="da-phone">{dict.phone}</label>
        <input id="da-phone" type="tel" required value={form.phone} onChange={set("phone")} className={field} />

        <label className={label} htmlFor="da-canton">{dict.canton}</label>
        <select id="da-canton" required value={form.canton} onChange={set("canton")} className={`${field} appearance-none`}>
          <option value="" disabled hidden></option>
          {CANTONS.map((c) => (
            <option key={c.code} value={c.code}>{c.code} — {cantonLabel(c)}</option>
          ))}
        </select>

        <label className={label} htmlFor="da-autoscout">{dict.autoscout}</label>
        <input id="da-autoscout" type="url" value={form.autoscout} onChange={set("autoscout")} placeholder="https://www.autoscout24.ch/de/s/seller-…" className={field} />

        <label className={label} htmlFor="da-note">{dict.note} <span className="normal-case text-ink-400/70">· {dict.optional}</span></label>
        <textarea id="da-note" rows={3} value={form.note} onChange={set("note")} className={`${field} resize-none`} />

        {error && (
          <p role="alert" className="mt-5 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-3.5 py-2.5 text-[0.875rem] text-red-deep">{error}</p>
        )}

        <button type="submit" disabled={busy} className="mt-9 w-full rounded-[var(--radius-sm)] bg-red px-4 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep disabled:opacity-60">
          {busy ? "…" : dict.submit}
        </button>
      </form>
    </div>
  );
}
