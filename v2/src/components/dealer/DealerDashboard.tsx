// Dealer dashboard island (/haendler/konto): open buyer requests → offer form
// (firm price + exact spec + photos + required AutoScout24 link + optional
// message) → own offers with status → buyer contact card when won.
// All reads/writes are RLS-scoped to the signed-in garage owner.
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/auth/client";
import { chf } from "@/lib/format";

export interface DealerKontoDict {
  title: string;
  hello: string;
  signout: string;
  applyTitle: string;
  applySub: string;
  applyCta: string;
  pendingTitle: string;
  pendingSub: string;
  openTitle: string;
  openEmpty: string;
  offerCta: string;
  offerTitle: string;
  price: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  km: string;
  fuel: string;
  gear: string;
  color: string;
  url: string;
  urlHint: string;
  urlError: string;
  photos: string;
  photosHint: string;
  message: string;
  optional: string;
  submit: string;
  sent: string;
  err: string;
  already: string;
  mineTitle: string;
  mineEmpty: string;
  mineWon: string;
  statusSubmitted: string;
  statusAccepted: string;
  statusRejected: string;
  statusExpired: string;
  budget: string;
  orSimilar: string;
  kmUnit: string;
}

interface OpenRequest {
  id: string;
  make: string | null;
  model: string | null;
  model_similar: boolean;
  body: string | null;
  budget_chf: number | null;
  year_from: number | null;
  km_max: number | null;
  fuel: string | null;
  gear: string | null;
  canton: string | null;
  radius_km: number | null;
  created_at: string;
}

interface MyOffer {
  id: string;
  request_id: string;
  amount_chf: number;
  status: string;
  make: string | null;
  model: string | null;
  trim: string | null;
  created_at: string;
}

interface Contact { name: string | null; email: string | null; phone: string | null }

const AS24_RE = /^https:\/\/(www\.)?autoscout24\.ch\//i;

const emptyOfferForm = {
  price: "", make: "", model: "", trim: "", year: "", km: "",
  fuel: "", gear: "", color: "", url: "", message: "",
};

export default function DealerDashboard({
  dict, userEmail, applyHref, homeHref,
}: {
  dict: DealerKontoDict; userEmail: string; applyHref: string; homeHref: string;
}) {
  const [state, setState] = useState<"loading" | "none" | "pending" | "active">("loading");
  const [garage, setGarage] = useState<{ id: string; name: string } | null>(null);
  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([]);
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);
  const [contacts, setContacts] = useState<Record<string, Contact>>({});
  const [formFor, setFormFor] = useState<string | null>(null); // request id
  const [form, setForm] = useState({ ...emptyOfferForm });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentFor, setSentFor] = useState<string | null>(null);

  const load = async () => {
    const sb = supabaseBrowser();
    const { data: g } = await sb.from("garages").select("id,name").limit(1).maybeSingle();
    if (g) {
      setGarage(g);
      setState("active");
      const [{ data: reqs }, { data: offs }] = await Promise.all([
        sb.from("requests_for_garages").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
        sb.from("offers").select("id,request_id,amount_chf,status,make,model,trim,created_at").order("created_at", { ascending: false }),
      ]);
      setOpenRequests((reqs ?? []) as OpenRequest[]);
      setMyOffers((offs ?? []) as MyOffer[]);
      for (const o of offs ?? []) {
        if (o.status === "accepted") {
          const { data } = await sb.rpc("contact_for_offer", { p_offer_id: o.id });
          if (data?.[0]) setContacts((c) => ({ ...c, [o.id]: data[0] }));
        }
      }
      return;
    }
    const { data: app } = await sb.from("dealer_applications").select("status").order("created_at", { ascending: false }).limit(1).maybeSingle();
    setState(app && app.status === "submitted" ? "pending" : "none");
  };

  useEffect(() => { void load(); }, []);

  const offeredRequestIds = useMemo(() => new Set(myOffers.map((o) => o.request_id)), [myOffers]);

  const openForm = (requestId: string, r: OpenRequest) => {
    setFormFor(requestId);
    setFormError(null);
    setFiles([]);
    setForm({
      ...emptyOfferForm,
      make: r.make ?? "",
      model: r.model ?? "",
      fuel: r.fuel ?? "",
      gear: r.gear ?? "",
    });
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitOffer = async (requestId: string) => {
    if (busy || !garage) return;
    setFormError(null);
    if (!AS24_RE.test(form.url.trim())) {
      setFormError(dict.urlError);
      return;
    }
    const price = Number(form.price.replace(/[^0-9.]/g, ""));
    if (!price || price <= 0) {
      setFormError(dict.err);
      return;
    }
    setBusy(true);
    const sb = supabaseBrowser();
    try {
      // Photos → storage first (public bucket), then the offer row.
      const photoUrls: string[] = [];
      for (const [i, file] of files.slice(0, 4).entries()) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${garage.id}/${Date.now()}-${i}.${ext}`;
        const { error: upErr } = await sb.storage.from("offer-photos").upload(path, file, { upsert: false });
        if (upErr) throw new Error("generic");
        photoUrls.push(path);
      }
      const { error: insErr } = await sb.from("offers").insert({
        garage_id: garage.id,
        request_id: requestId,
        amount_chf: price,
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        trim: form.trim.trim() || null,
        first_reg: form.year ? Number(form.year) : null,
        km: form.km ? Number(form.km.replace(/[^0-9]/g, "")) : null,
        fuel: form.fuel.trim() || null,
        gear: form.gear.trim() || null,
        color: form.color.trim() || null,
        photos: photoUrls,
        message: form.message.trim() || null,
        autoscout_url: form.url.trim(),
      });
      if (insErr) throw new Error(insErr.code === "23505" ? "dup" : "generic");
      setSentFor(requestId);
      setFormFor(null);
      await load();
    } catch (err) {
      setFormError((err as Error).message === "dup" ? dict.already : dict.err);
    } finally {
      setBusy(false);
    }
  };

  const signout = async () => {
    await supabaseBrowser().auth.signOut();
    location.assign(homeHref);
  };

  const carOf = (r: OpenRequest) => [r.make, r.model].filter(Boolean).join(" ") || "—";

  if (state === "loading") {
    return <div className="py-32 text-center text-[0.9rem] text-white/40 [font-family:var(--font-mono)]">…</div>;
  }

  if (state === "none" || state === "pending") {
    const pending = state === "pending";
    return (
      <div className="mx-auto flex w-full max-w-[32rem] flex-col items-center py-20 text-center">
        <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-medium leading-tight text-white [font-family:var(--font-display)]">
          {pending ? dict.pendingTitle : dict.applyTitle}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-white/60">
          {pending ? dict.pendingSub : dict.applySub}
        </p>
        {!pending && (
          <a href={applyHref} className="mt-8 inline-flex items-center rounded-[var(--radius-sm)] bg-red px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep">
            {dict.applyCta}
          </a>
        )}
        <button type="button" onClick={signout} className="mt-6 text-[0.875rem] text-white/40 transition-colors hover:text-white">
          {dict.signout}
        </button>
      </div>
    );
  }

  const label = "block text-[10px] uppercase tracking-[0.14em] text-white/40 [font-family:var(--font-mono)]";
  const field = "mt-1.5 w-full rounded-[6px] border border-white/15 bg-white/5 px-3 py-2 text-[0.95rem] text-white outline-none transition-colors focus:border-white/40";

  return (
    <div className="mx-auto w-full max-w-[68rem]">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-medium leading-tight text-white [font-family:var(--font-display)]">{dict.title}</h1>
          <p className="mt-1.5 text-[0.85rem] text-white/40">
            <span className="[font-family:var(--font-mono)] text-[0.8rem]">{garage?.name}</span>
            <span className="mx-2 text-white/20">·</span>
            {userEmail}
          </p>
        </div>
        <button type="button" onClick={signout} className="text-[0.875rem] text-white/40 transition-colors hover:text-white">{dict.signout}</button>
      </div>

      {/* open requests */}
      <h2 className="mt-10 text-[11px] uppercase tracking-[0.16em] text-white/40 [font-family:var(--font-mono)]">{dict.openTitle}</h2>
      {openRequests.length === 0 ? (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-white/15 px-5 py-6 text-[0.9rem] text-white/50">{dict.openEmpty}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {openRequests.map((r) => {
            const offered = offeredRequestIds.has(r.id);
            const showForm = formFor === r.id;
            return (
              <div key={r.id} className={`rounded-[var(--radius-sm)] border p-5 transition-colors ${showForm ? "border-white/30 bg-white/[0.03]" : "border-white/10"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <div>
                    <p className="text-[1.05rem] font-medium text-white">
                      {carOf(r)}
                      {r.model_similar && r.model && <span className="ml-2 text-[0.8rem] font-normal text-white/40">· {dict.orSimilar}</span>}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-white/40 [font-family:var(--font-mono)]">
                      {dict.budget} {r.budget_chf ? chf(Number(r.budget_chf)) : "—"}
                      {r.year_from ? ` · ${r.year_from}+` : ""}
                      {r.km_max ? ` · ≤ ${Number(r.km_max).toLocaleString("de-CH")} ${dict.kmUnit}` : ""}
                      {r.fuel ? ` · ${r.fuel}` : ""}{r.gear ? ` · ${r.gear}` : ""}
                      {r.canton ? ` · ${r.canton}${r.radius_km ? ` +${r.radius_km} km` : ""}` : ""}
                    </p>
                  </div>
                  {sentFor === r.id ? (
                    <span className="text-[0.85rem] text-white/60">{dict.sent}</span>
                  ) : offered ? (
                    <span className="text-[11px] uppercase tracking-[0.1em] text-white/35 [font-family:var(--font-mono)]">{dict.statusSubmitted}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => (showForm ? setFormFor(null) : openForm(r.id, r))}
                      className="rounded-[var(--radius-sm)] border border-white/25 px-4 py-2 text-[0.875rem] font-medium text-white transition-colors hover:border-white/60"
                    >
                      {dict.offerCta}
                    </button>
                  )}
                </div>

                {/* offer form */}
                {showForm && (
                  <div className="mt-5 border-t border-white/10 pt-5">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40 [font-family:var(--font-mono)]">{dict.offerTitle}</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className={label}>{dict.price}</label>
                        <input inputMode="numeric" value={form.price} onChange={set("price")} className={`${field} [font-family:var(--font-mono)]`} placeholder="42'800" />
                      </div>
                      <div><label className={label}>{dict.make}</label><input value={form.make} onChange={set("make")} className={field} /></div>
                      <div><label className={label}>{dict.model}</label><input value={form.model} onChange={set("model")} className={field} /></div>
                      <div><label className={label}>{dict.trim} · {dict.optional}</label><input value={form.trim} onChange={set("trim")} className={field} /></div>
                      <div><label className={label}>{dict.year}</label><input inputMode="numeric" value={form.year} onChange={set("year")} className={field} placeholder="2021" /></div>
                      <div><label className={label}>{dict.km}</label><input inputMode="numeric" value={form.km} onChange={set("km")} className={field} /></div>
                      <div><label className={label}>{dict.fuel}</label><input value={form.fuel} onChange={set("fuel")} className={field} /></div>
                      <div><label className={label}>{dict.gear}</label><input value={form.gear} onChange={set("gear")} className={field} /></div>
                      <div><label className={label}>{dict.color} · {dict.optional}</label><input value={form.color} onChange={set("color")} className={field} /></div>
                    </div>

                    <div className="mt-4">
                      <label className={label}>{dict.url}</label>
                      <input type="url" value={form.url} onChange={set("url")} className={field} placeholder="https://www.autoscout24.ch/de/d/…" />
                      <p className="mt-1.5 text-[0.78rem] text-white/35">{dict.urlHint}</p>
                    </div>

                    <div className="mt-4">
                      <label className={label}>{dict.photos} · {dict.optional}</label>
                      <input
                        type="file" accept="image/*" multiple
                        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 4))}
                        className="mt-1.5 block w-full text-[0.85rem] text-white/60 file:mr-3 file:rounded-[6px] file:border file:border-white/25 file:bg-transparent file:px-3 file:py-1.5 file:text-[0.8rem] file:text-white"
                      />
                      <p className="mt-1.5 text-[0.78rem] text-white/35">{dict.photosHint}</p>
                    </div>

                    <div className="mt-4">
                      <label className={label}>{dict.message} · {dict.optional}</label>
                      <textarea rows={2} value={form.message} onChange={set("message")} className={`${field} resize-none`} />
                    </div>

                    {formError && (
                      <p role="alert" className="mt-4 rounded-[6px] border border-red/40 bg-red/10 px-3.5 py-2.5 text-[0.875rem] text-white">{formError}</p>
                    )}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void submitOffer(r.id)}
                      className="mt-5 rounded-[var(--radius-sm)] bg-red px-6 py-3 text-[0.9rem] font-medium text-white transition-colors hover:bg-red-deep disabled:opacity-50"
                    >
                      {busy ? "…" : dict.submit}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* my offers */}
      <h2 className="mt-14 text-[11px] uppercase tracking-[0.16em] text-white/40 [font-family:var(--font-mono)]">{dict.mineTitle}</h2>
      {myOffers.length === 0 ? (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-white/15 px-5 py-6 text-[0.9rem] text-white/50">{dict.mineEmpty}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {myOffers.map((o) => {
            const won = o.status === "accepted";
            const contact = contacts[o.id];
            const statusLabel =
              o.status === "submitted" ? dict.statusSubmitted
              : won ? dict.statusAccepted
              : o.status === "rejected" ? dict.statusRejected
              : dict.statusExpired;
            return (
              <div key={o.id} className={`rounded-[var(--radius-sm)] border p-5 ${won ? "border-red bg-red/[0.06]" : "border-white/10"}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-[1rem] font-medium text-white">
                    {[o.make, o.model, o.trim].filter(Boolean).join(" ") || "—"}
                    <span className="ml-3 num text-[1.05rem] text-white/80">{chf(Number(o.amount_chf))}</span>
                  </p>
                  <span className={`text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-mono)] ${won ? "text-red" : "text-white/40"}`}>
                    {statusLabel}
                  </span>
                </div>
                {won && contact && (
                  <div className="mt-4 rounded-[6px] border border-red/40 bg-void p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-red [font-family:var(--font-mono)]">{dict.mineWon}</p>
                    <p className="mt-2 text-[0.95rem] font-medium text-white">{contact.name}</p>
                    {contact.email && <a href={`mailto:${contact.email}`} className="mt-0.5 block text-[0.9rem] text-white/60 hover:text-white">{contact.email}</a>}
                    {contact.phone && <a href={`tel:${contact.phone}`} className="mt-0.5 block text-[0.9rem] text-white/60 hover:text-white">{contact.phone}</a>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
