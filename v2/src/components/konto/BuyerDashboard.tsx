// Buyer dashboard island: requests → offers side-by-side → accept → contact
// reveal. Data is fetched client-side with the session cookie (RLS scopes
// every query to the signed-in buyer); acceptance goes through the
// transactional accept_my_offer() RPC (bill-once guarantee upstream).
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/auth/client";
import { chf } from "@/lib/format";
import { gsap } from "@/lib/gsap";

export interface KontoDict {
  title: string;
  hello: string;
  requests: string;
  noRequests: string;
  noRequestsSub: string;
  startRequest: string;
  newRequest: string;
  offers: string;
  noOffers: string;
  statusOpen: string;
  statusFulfilled: string;
  statusClosed: string;
  offerAccepted: string;
  offerRejected: string;
  accept: string;
  acceptConfirm: string;
  contactTitle: string;
  contactSub: string;
  viewListing: string;
  budget: string;
  firmPrice: string;
  km: string;
  errAccept: string;
  signout: string;
  orSimilar: string;
}

interface RequestRow {
  id: string;
  status: "open" | "fulfilled" | "closed";
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
  created_at: string;
}

interface OfferRow {
  id: string;
  request_id: string;
  garage_id: string;
  amount_chf: number;
  status: "submitted" | "accepted" | "rejected" | "expired";
  make: string | null;
  model: string | null;
  trim: string | null;
  first_reg: number | null;
  km: number | null;
  fuel: string | null;
  gear: string | null;
  color: string | null;
  photos: string[];
  message: string | null;
  autoscout_url: string;
  created_at: string;
}

interface GarageCard { id: string; name: string; canton: string | null }
interface Contact { role: string; name: string | null; email: string | null; phone: string | null }

const PHOTO_BASE = `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/offer-photos/`;

export default function BuyerDashboard({
  dict, userEmail, anfrageHref, homeHref,
}: {
  dict: KontoDict; userEmail: string; anfrageHref: string; homeHref: string;
}) {
  const [requests, setRequests] = useState<RequestRow[] | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [garages, setGarages] = useState<Record<string, GarageCard>>({});
  const [contacts, setContacts] = useState<Record<string, Contact>>({}); // offer_id → dealer card
  const [error, setError] = useState<string | null>(null);
  const [busyOffer, setBusyOffer] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const sb = supabaseBrowser();
    const { data: reqs, error: reqErr } = await sb
      .from("requests")
      .select("id,status,make,model,model_similar,body,budget_chf,year_from,km_max,fuel,gear,canton,created_at")
      .order("created_at", { ascending: false });
    if (reqErr) { setError(reqErr.message); setRequests([]); return; }
    setRequests(reqs ?? []);
    if (!reqs?.length) return;

    const { data: offs } = await sb
      .from("offers")
      .select("id,request_id,garage_id,amount_chf,status,make,model,trim,first_reg,km,fuel,gear,color,photos,message,autoscout_url,created_at")
      .in("request_id", reqs.map((r) => r.id))
      .order("amount_chf", { ascending: true });
    setOffers(offs ?? []);

    const garageIds = [...new Set((offs ?? []).map((o) => o.garage_id))];
    if (garageIds.length) {
      const { data: gs } = await sb.from("garages_public").select("id,name,canton").in("id", garageIds);
      setGarages(Object.fromEntries((gs ?? []).map((g) => [g.id, g])));
    }

    // Contact cards for already-accepted offers
    for (const o of offs ?? []) {
      if (o.status === "accepted") void loadContact(o.id);
    }
  };

  const loadContact = async (offerId: string) => {
    const { data } = await supabaseBrowser().rpc("contact_for_offer", { p_offer_id: offerId });
    if (data?.[0]) setContacts((c) => ({ ...c, [offerId]: data[0] }));
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!rootRef.current || requests === null) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll(".kd-in"),
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05, clearProps: "all" },
    );
  }, [requests !== null]);

  const accept = async (offer: OfferRow) => {
    if (busyOffer) return;
    if (!confirm(dict.acceptConfirm)) return;
    setBusyOffer(offer.id);
    setError(null);
    const { error: err } = await supabaseBrowser().rpc("accept_my_offer", { p_offer_id: offer.id });
    if (err) {
      setError(dict.errAccept);
      setBusyOffer(null);
      return;
    }
    await load();
    await loadContact(offer.id);
    setBusyOffer(null);
  };

  const signout = async () => {
    await supabaseBrowser().auth.signOut();
    location.assign(homeHref);
  };

  const offersByRequest = useMemo(() => {
    const m: Record<string, OfferRow[]> = {};
    for (const o of offers) (m[o.request_id] ??= []).push(o);
    return m;
  }, [offers]);

  if (requests === null) {
    return <div className="py-32 text-center text-[0.9rem] text-ink-400 [font-family:var(--font-mono)]">…</div>;
  }

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[68rem]">
      {/* header */}
      <div className="kd-in flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] font-medium leading-tight text-ink-900 [font-family:var(--font-display)]">
            {dict.title}
          </h1>
          <p className="mt-1.5 text-[0.85rem] text-ink-400">
            <span className="[font-family:var(--font-mono)] text-[0.8rem]">{dict.hello}</span>{" "}
            <span className="text-ink-500">{userEmail}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href={anfrageHref} className="inline-flex items-center rounded-[var(--radius-sm)] bg-red px-4 py-2.5 text-[0.875rem] font-medium text-white transition-colors hover:bg-red-deep">
            {dict.newRequest}
          </a>
          <button type="button" onClick={signout} className="text-[0.875rem] text-ink-400 transition-colors hover:text-ink-900">
            {dict.signout}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-3 py-2.5 text-[0.85rem] text-red-deep">{error}</p>
      )}

      {/* empty state */}
      {requests.length === 0 && (
        <div className="kd-in flex flex-col items-start py-20">
          <p className="text-[1.35rem] font-medium text-ink-900 [font-family:var(--font-display)]">{dict.noRequests}</p>
          <p className="mt-2 max-w-[36rem] text-[0.95rem] leading-relaxed text-ink-500">{dict.noRequestsSub}</p>
          <a href={anfrageHref} className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-red px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-red-deep">
            {dict.startRequest}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      )}

      {/* requests */}
      {requests.map((r) => {
        const ros = offersByRequest[r.id] ?? [];
        const statusLabel = r.status === "open" ? dict.statusOpen : r.status === "fulfilled" ? dict.statusFulfilled : dict.statusClosed;
        const carLabel = [r.make, r.model].filter(Boolean).join(" ") || "—";
        return (
          <section key={r.id} className="kd-in mt-12">
            {/* request dossier row */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-[1.3rem] font-medium text-ink-900 [font-family:var(--font-display)]">
                  {carLabel}
                  {r.model_similar && r.model && (
                    <span className="ml-2 text-[0.85rem] font-normal text-ink-400">· {dict.orSimilar}</span>
                  )}
                </h2>
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-mono)] ${
                  r.status === "fulfilled" ? "border-red/40 text-red" : "border-line-2 text-ink-400"
                }`}>{statusLabel}</span>
              </div>
              <p className="text-[0.8rem] text-ink-400 [font-family:var(--font-mono)]">
                {dict.budget} {r.budget_chf ? chf(Number(r.budget_chf)) : "—"}
                {r.year_from ? ` · ${r.year_from}+` : ""}
                {r.km_max ? ` · ≤ ${Number(r.km_max).toLocaleString("de-CH")} ${dict.km}` : ""}
              </p>
            </div>

            {/* offers */}
            {ros.length === 0 ? (
              <p className="mt-5 rounded-[var(--radius-sm)] border border-dashed border-line-2 px-5 py-6 text-[0.9rem] leading-relaxed text-ink-500">
                {dict.noOffers}
              </p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {ros.map((o) => {
                  const g = garages[o.garage_id];
                  const contact = contacts[o.id];
                  const won = o.status === "accepted";
                  const lost = o.status === "rejected" && r.status === "fulfilled";
                  const car = [o.make, o.model, o.trim].filter(Boolean).join(" ");
                  return (
                    <article
                      key={o.id}
                      className={`rounded-[var(--radius-sm)] border p-5 transition-colors ${
                        won ? "border-red bg-red/[0.03]" : lost ? "border-line opacity-55" : "border-line-2"
                      }`}
                    >
                      {/* dealer + status */}
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[0.8rem] text-ink-500 [font-family:var(--font-mono)]">
                          {g ? `${g.name}${g.canton ? ` · ${g.canton}` : ""}` : "—"}
                        </p>
                        {won && <span className="text-[11px] uppercase tracking-[0.1em] text-red [font-family:var(--font-mono)]">{dict.offerAccepted}</span>}
                        {lost && <span className="text-[11px] uppercase tracking-[0.1em] text-ink-400 [font-family:var(--font-mono)]">{dict.offerRejected}</span>}
                      </div>

                      {/* photos */}
                      {o.photos.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                          {o.photos.slice(0, 4).map((ph) => (
                            <img key={ph} src={ph.startsWith("http") ? ph : PHOTO_BASE + ph} alt={car}
                              className="h-24 w-32 shrink-0 rounded-[6px] border border-line object-cover" loading="lazy" />
                          ))}
                        </div>
                      )}

                      {/* car + price */}
                      <h3 className="mt-3 text-[1.1rem] font-medium leading-snug text-ink-900">{car || "—"}</h3>
                      <p className="mt-0.5 text-[0.85rem] text-ink-500">
                        {[o.first_reg, o.km != null ? `${Number(o.km).toLocaleString("de-CH")} ${dict.km}` : null, o.fuel, o.gear, o.color]
                          .filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-3 flex items-baseline gap-2">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-ink-400 [font-family:var(--font-mono)]">{dict.firmPrice}</span>
                        <span className="num text-[1.5rem] font-medium text-ink-900">{chf(Number(o.amount_chf))}</span>
                      </p>

                      {o.message && (
                        <p className="mt-3 border-l-0 rounded-[6px] bg-paper-2 px-3.5 py-2.5 text-[0.875rem] leading-relaxed text-ink-500">
                          «{o.message}»
                        </p>
                      )}

                      {o.autoscout_url && (
                        <a href={o.autoscout_url} target="_blank" rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[0.85rem] text-ink-500 underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink-900">
                          {dict.viewListing}
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3.5 8.5l5-5M5 3h3.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </a>
                      )}

                      {/* accept / contact */}
                      {r.status === "open" && o.status === "submitted" && (
                        <button
                          type="button"
                          disabled={busyOffer !== null}
                          onClick={() => void accept(o)}
                          className="mt-4 w-full rounded-[var(--radius-sm)] border border-red px-4 py-2.5 text-[0.9rem] font-medium text-red transition-colors hover:bg-red hover:text-white disabled:opacity-50"
                        >
                          {busyOffer === o.id ? "…" : dict.accept}
                        </button>
                      )}

                      {won && contact && (
                        <div className="mt-4 rounded-[var(--radius-sm)] border border-red/30 bg-white p-4">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-red [font-family:var(--font-mono)]">{dict.contactTitle}</p>
                          <p className="mt-2 text-[1rem] font-medium text-ink-900">{contact.name}</p>
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="mt-0.5 block text-[0.9rem] text-ink-500 hover:text-ink-900">{contact.email}</a>
                          )}
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="mt-0.5 block text-[0.9rem] text-ink-500 hover:text-ink-900">{contact.phone}</a>
                          )}
                          <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-400">{dict.contactSub}</p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
