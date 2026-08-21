// Buyer dashboard island — SBB-logistics instrument language: warm-gray
// canvas, white rounded-XL cards, pill controls with status dots, small mono
// labels over big technical values. The request is the hero object; offers
// are the containers that arrive for it. Data layer: RLS-scoped queries +
// transactional accept_my_offer() → contact_for_offer() reveal.
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
  year: string;
  fuel: string;
  gear: string;
  region: string;
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
  radius_km?: number | null;
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

/* ── small building blocks ── */

function MonoLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block text-[10px] uppercase tracking-[0.16em] text-ink-400 [font-family:var(--font-mono)] ${className}`}>
      {children}
    </span>
  );
}

function StatusPill({ tone, children }: { tone: "open" | "won" | "muted"; children: React.ReactNode }) {
  const dot = tone === "open" ? "bg-[oklch(0.72_0.17_145)]" : tone === "won" ? "bg-red" : "bg-ink-400/50";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-700 [font-family:var(--font-mono)]">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

function SpecPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-2 rounded-full border border-line bg-white px-3.5 py-2">
      <span className="text-[9px] uppercase tracking-[0.14em] text-ink-400 [font-family:var(--font-mono)]">{label}</span>
      <span className="num text-[0.85rem] font-medium text-ink-900">{value}</span>
    </span>
  );
}

/* ── the dashboard ── */

export interface KontoDemoData {
  requests: RequestRow[];
  offers: OfferRow[];
  garages: Record<string, GarageCard>;
  contacts?: Record<string, Contact>;
}

export default function BuyerDashboard({
  dict, userEmail, anfrageHref, homeHref, demo,
}: {
  dict: KontoDict; userEmail: string; anfrageHref: string; homeHref: string; demo?: KontoDemoData;
}) {
  const [requests, setRequests] = useState<RequestRow[] | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [garages, setGarages] = useState<Record<string, GarageCard>>({});
  const [contacts, setContacts] = useState<Record<string, Contact>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyOffer, setBusyOffer] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (demo) {
      setRequests(demo.requests);
      setOffers(demo.offers);
      setGarages(demo.garages);
      setContacts(demo.contacts ?? {});
      return;
    }
    const sb = supabaseBrowser();
    const { data: reqs, error: reqErr } = await sb
      .from("requests")
      .select("id,status,make,model,model_similar,body,budget_chf,year_from,km_max,fuel,gear,canton,radius_km,created_at")
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
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.07, clearProps: "all" },
    );
  }, [requests !== null]);

  const accept = async (offer: OfferRow) => {
    if (demo || busyOffer) return;
    if (!confirm(dict.acceptConfirm)) return;
    setBusyOffer(offer.id);
    setError(null);
    const { error: err } = await supabaseBrowser().rpc("accept_my_offer", { p_offer_id: offer.id });
    if (err) { setError(dict.errAccept); setBusyOffer(null); return; }
    await load();
    await loadContact(offer.id);
    setBusyOffer(null);
  };

  const signout = async () => {
    if (demo) return;
    await supabaseBrowser().auth.signOut();
    location.assign(homeHref);
  };

  const offersByRequest = useMemo(() => {
    const m: Record<string, OfferRow[]> = {};
    for (const o of offers) (m[o.request_id] ??= []).push(o);
    return m;
  }, [offers]);

  if (requests === null) {
    return <div className="py-40 text-center text-[0.9rem] text-ink-400 [font-family:var(--font-mono)]">…</div>;
  }

  return (
    <div ref={rootRef} className="mx-auto w-full max-w-[78rem]">
      {/* ═══ top bar: title · avatar pill · actions ═══ */}
      <div className="kd-in flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[clamp(1.7rem,3.4vw,2.2rem)] font-medium leading-none tracking-[-0.01em] text-ink-900 [font-family:var(--font-display)]">
          {dict.title}
        </h1>
        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 sm:inline-flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-red text-[0.75rem] font-semibold uppercase text-white">
              {userEmail[0] ?? "•"}
            </span>
            <span className="max-w-[16rem] truncate text-[0.82rem] text-ink-700">{userEmail}</span>
          </span>
          <a
            href={anfrageHref}
            className="inline-flex items-center gap-2 rounded-full bg-red px-4.5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-red-deep"
            style={{ paddingLeft: "1.125rem", paddingRight: "1.125rem" }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            {dict.newRequest}
          </a>
          <button
            type="button"
            onClick={signout}
            title={dict.signout}
            aria-label={dict.signout}
            className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink-500 transition-colors hover:border-ink-400 hover:text-ink-900"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6M10.5 11 14 8l-3.5-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="kd-in mt-6 rounded-[var(--radius-md)] border border-red/30 bg-red/5 px-4 py-3 text-[0.85rem] text-red-deep">{error}</p>
      )}

      {/* ═══ empty state ═══ */}
      {requests.length === 0 && (
        <div className="kd-in mt-6 rounded-[var(--radius-xl)] bg-white p-10 sm:p-14" style={{ boxShadow: "0 1px 2px oklch(0.2 0.01 27 / 0.04)" }}>
          <MonoLabel>{dict.requests}</MonoLabel>
          <p className="mt-4 text-[clamp(1.6rem,3.4vw,2.2rem)] font-medium leading-tight text-ink-900 [font-family:var(--font-display)]">{dict.noRequests}</p>
          <p className="mt-3 max-w-[34rem] text-[0.95rem] leading-relaxed text-ink-500">{dict.noRequestsSub}</p>
          <a href={anfrageHref} className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-red px-6 py-3 text-[0.92rem] font-medium text-white transition-colors hover:bg-red-deep">
            {dict.startRequest}
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      )}

      {/* ═══ requests: each a dossier card + its offer cards ═══ */}
      {requests.map((r, ri) => {
        const ros = offersByRequest[r.id] ?? [];
        const carLabel = [r.make, r.model].filter(Boolean).join(" ") || "—";
        const won = r.status === "fulfilled";
        return (
          <section key={r.id} className={`kd-in ${ri === 0 ? "mt-6" : "mt-10"}`}>
            {/* ── request hero card ── */}
            <div className="rounded-[var(--radius-xl)] bg-white p-7 sm:p-9" style={{ boxShadow: "0 1px 2px oklch(0.2 0.01 27 / 0.04)" }}>
              <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                <div className="min-w-0">
                  <MonoLabel>{dict.requests} · #{r.id.slice(0, 4).toUpperCase()}</MonoLabel>
                  <p className="mt-2.5 text-[clamp(1.8rem,4vw,2.7rem)] font-medium leading-[1.02] tracking-[-0.015em] text-ink-900 [font-family:var(--font-display)]">
                    {carLabel}
                    {r.model_similar && r.model && (
                      <span className="ml-3 align-middle text-[0.55em] font-normal tracking-normal text-ink-400">{dict.orSimilar}</span>
                    )}
                  </p>
                </div>
                <StatusPill tone={won ? "won" : r.status === "open" ? "open" : "muted"}>
                  {won ? dict.statusFulfilled : r.status === "open" ? dict.statusOpen : dict.statusClosed}
                </StatusPill>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {r.budget_chf != null && <SpecPill label={dict.budget} value={chf(Number(r.budget_chf))} />}
                {r.year_from != null && <SpecPill label={dict.year} value={`${r.year_from}+`} />}
                {r.km_max != null && <SpecPill label={dict.km} value={`≤ ${Number(r.km_max).toLocaleString("de-CH")}`} />}
                {r.fuel && <SpecPill label={dict.fuel} value={r.fuel} />}
                {r.gear && <SpecPill label={dict.gear} value={r.gear} />}
                {r.canton && <SpecPill label={dict.region} value={`${r.canton}${r.radius_km ? ` +${r.radius_km} km` : ""}`} />}
              </div>
            </div>

            {/* ── offers ── */}
            <div className="mt-3">
              {ros.length === 0 ? (
                <div className="rounded-[var(--radius-xl)] border border-dashed border-line-2 px-7 py-8">
                  <MonoLabel>{dict.offers} · 0</MonoLabel>
                  <p className="mt-2.5 max-w-[36rem] text-[0.92rem] leading-relaxed text-ink-500">{dict.noOffers}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-1 py-3">
                    <MonoLabel>{dict.offers} · {String(ros.length).padStart(2, "0")}</MonoLabel>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {ros.map((o) => {
                      const g = garages[o.garage_id];
                      const contact = contacts[o.id];
                      const oWon = o.status === "accepted";
                      const oLost = o.status === "rejected" && won;
                      const car = [o.make, o.model, o.trim].filter(Boolean).join(" ");
                      return (
                        <article
                          key={o.id}
                          className={`flex flex-col rounded-[var(--radius-xl)] bg-white p-6 transition-shadow sm:p-7 ${oLost ? "opacity-50" : ""}`}
                          style={{
                            boxShadow: oWon
                              ? "0 0 0 1.5px var(--color-red), 0 10px 32px -12px oklch(0.52 0.22 27 / 0.25)"
                              : "0 1px 2px oklch(0.2 0.01 27 / 0.04)",
                          }}
                        >
                          {/* dealer chip + status */}
                          <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex min-w-0 items-center gap-2.5 rounded-full border border-line py-1 pl-1 pr-3.5">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-900 text-[0.65rem] font-semibold uppercase text-white">
                                {(g?.name ?? "•")[0]}
                              </span>
                              <span className="truncate text-[0.8rem] text-ink-700">
                                {g ? g.name : "—"}{g?.canton ? <span className="text-ink-400"> · {g.canton}</span> : null}
                              </span>
                            </span>
                            {oWon && <StatusPill tone="won">{dict.offerAccepted}</StatusPill>}
                            {oLost && <span className="text-[10px] uppercase tracking-[0.12em] text-ink-400 [font-family:var(--font-mono)]">{dict.offerRejected}</span>}
                          </div>

                          {/* photo gallery — swipe / scroll through the actual car */}
                          {o.photos.length > 0 && (
                            <div className="relative mt-4">
                              <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-[var(--radius-lg)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {o.photos.map((ph) => (
                                  <img
                                    key={ph}
                                    src={ph.startsWith("http") || ph.startsWith("/") ? ph : PHOTO_BASE + ph}
                                    alt={car}
                                    className="aspect-[3/2] w-[86%] shrink-0 snap-center rounded-[var(--radius-lg)] bg-paper-2 object-cover sm:w-[70%]"
                                    loading="lazy"
                                  />
                                ))}
                              </div>
                              {o.photos.length > 1 && (
                                <span className="pointer-events-none absolute bottom-2.5 right-2.5 rounded-full bg-ink-900/70 px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-white [font-family:var(--font-mono)]">
                                  {o.photos.length} ›
                                </span>
                              )}
                            </div>
                          )}

                          {/* car + spec */}
                          <h3 className="mt-5 text-[1.15rem] font-medium leading-snug text-ink-900">{car || "—"}</h3>
                          <p className="mt-1 text-[0.83rem] text-ink-500">
                            {[o.first_reg, o.km != null ? `${Number(o.km).toLocaleString("de-CH")} ${dict.km}` : null, o.fuel, o.gear, o.color]
                              .filter(Boolean).join("  ·  ")}
                          </p>

                          {/* price — the big technical value */}
                          <div className="mt-5">
                            <MonoLabel>{dict.firmPrice}</MonoLabel>
                            <p className="num mt-1 text-[2rem] font-medium leading-none tracking-[-0.01em] text-ink-900">
                              {chf(Number(o.amount_chf))}
                            </p>
                          </div>

                          {o.message && (
                            <p className="mt-5 rounded-[var(--radius-md)] bg-paper-2 px-4 py-3 text-[0.85rem] leading-relaxed text-ink-700">
                              «{o.message}»
                            </p>
                          )}

                          {/* footer: listing link · accept */}
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
                            {o.autoscout_url ? (
                              <a href={o.autoscout_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[0.8rem] text-ink-700 transition-colors hover:border-ink-400 hover:text-ink-900">
                                {dict.viewListing}
                                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3.5 8.5l5-5M5 3h3.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </a>
                            ) : <span />}
                            {r.status === "open" && o.status === "submitted" && (
                              <button
                                type="button"
                                disabled={busyOffer !== null}
                                onClick={() => void accept(o)}
                                className="inline-flex items-center gap-2 rounded-full bg-red px-5 py-2.5 text-[0.85rem] font-medium text-white transition-colors hover:bg-red-deep disabled:opacity-50"
                              >
                                {busyOffer === o.id ? "…" : dict.accept}
                              </button>
                            )}
                          </div>

                          {/* contact reveal */}
                          {oWon && contact && (
                            <div className="mt-5 rounded-[var(--radius-lg)] bg-paper-2 p-5">
                              <MonoLabel className="!text-red">{dict.contactTitle}</MonoLabel>
                              <p className="mt-2 text-[1.05rem] font-medium text-ink-900">{contact.name}</p>
                              <div className="mt-1 flex flex-col gap-0.5">
                                {contact.email && <a href={`mailto:${contact.email}`} className="text-[0.88rem] text-ink-500 transition-colors hover:text-ink-900">{contact.email}</a>}
                                {contact.phone && <a href={`tel:${contact.phone}`} className="text-[0.88rem] text-ink-500 transition-colors hover:text-ink-900">{contact.phone}</a>}
                              </div>
                              <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-400">{dict.contactSub}</p>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
