"use client";

import { useEffect, useState } from "react";
import { Send, TrendingUp, Clock, CheckCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardShell, DashboardNotice } from "@/components/dashboard/shell";
import { chf, timeAgo, labelList } from "@/lib/format";

type BuyerRequest = {
  id: string;
  budget_min: number;
  budget_max: number;
  body_types: string[];
  brands: string[];
  year_min: number | null;
  year_max: number | null;
  fuel_types: string[];
  transmissions: string[];
  mileage_max: number | null;
  canton: string | null;
  created_at: string;
  answered: boolean;
};

type Feed = {
  companyName: string;
  offersSent: number;
  requests: BuyerRequest[];
};

const FIELD =
  "w-full rounded-lg border border-[oklch(0.916_0.004_27.0)] bg-white px-3 py-2 text-[13px] text-[oklch(0.150_0.012_27.0)] outline-none transition focus:border-[oklch(0.448_0.228_27.3)]";

function OfferForm({
  request,
  onClose,
  onSent,
}: {
  request: BuyerRequest;
  onClose: () => void;
  onSent: () => void;
}) {
  const t = useTranslations("dash.dealer");
  const [form, setForm] = useState({
    make: "", model: "", year: "", mileage: "", fuel: "", transmission: "", price: "", description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          make: form.make,
          model: form.model,
          year: Number(form.year),
          mileage: Number(form.mileage),
          fuel: form.fuel,
          transmission: form.transmission,
          price: Number(form.price),
          description: form.description || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? t("offerFailed"));
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("offerFailed"));
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[oklch(0.916_0.004_27.0)] bg-[oklch(0.985_0.003_27.0)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[oklch(0.150_0.012_27.0)]">{t("yourOffer")}</p>
        <button onClick={onClose} className="cursor-pointer p-1 text-[oklch(0.560_0.006_27.0)] hover:text-[oklch(0.150_0.012_27.0)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder={t("makePh")} value={form.make} onChange={set("make")} className={FIELD} />
          <input required placeholder={t("modelPh")} value={form.model} onChange={set("model")} className={FIELD} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input required type="number" min={1990} max={2100} placeholder={t("yearPh")} value={form.year} onChange={set("year")} className={FIELD} />
          <input required type="number" min={0} placeholder={t("mileagePh")} value={form.mileage} onChange={set("mileage")} className={FIELD} />
          <input required type="number" min={0} placeholder={t("pricePh")} value={form.price} onChange={set("price")} className={FIELD} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder={t("fuelPh")} value={form.fuel} onChange={set("fuel")} className={FIELD} />
          <input required placeholder={t("transmissionPh")} value={form.transmission} onChange={set("transmission")} className={FIELD} />
        </div>
        <textarea rows={2} placeholder={t("descriptionPh")} value={form.description} onChange={set("description")} className={FIELD} />
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[oklch(0.448_0.228_27.3)] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[oklch(0.400_0.218_27.3)] disabled:opacity-60"
        >
          <Send className="h-3 w-3" />
          {loading ? t("sending") : t("sendOffer")}
        </button>
      </form>
    </div>
  );
}

export default function DealerDashboard() {
  const t = useTranslations("dash.dealer");
  const tD = useTranslations("dash");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [pending, setPending] = useState<string | null>(null); // company awaiting approval
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState<string | null>(null);

  const load = () => {
    fetch("/api/dealer/requests")
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (r.status === 403 && body.status === "PENDING") {
          setPending(body.companyName ?? "Your dealership");
          return null;
        }
        if (!r.ok) throw new Error(body.error ?? tD("wrong"));
        return body;
      })
      .then((d) => d && setFeed(d))
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  return (
    <DashboardShell section={t("section")} initial={feed?.companyName?.[0]?.toUpperCase()}>
      {pending && (
        <DashboardNotice
          title={t("pendingTitle")}
          body={t("pendingBody", { company: pending })}
        />
      )}

      {error && <DashboardNotice title={tD("wrong")} body={error} />}

      {!pending && !error && feed === null && (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white" />
          ))}
        </div>
      )}

      {feed && (
        <>
          <div className="mb-8">
            <h1 className="text-[1.5rem] font-bold tracking-tight text-[oklch(0.112_0.012_27.0)]">
              {feed.companyName}
            </h1>
            <p className="mt-0.5 text-[14px] text-[oklch(0.500_0.008_27.0)]">
              {feed.requests.length === 0
                ? t("introEmpty")
                : (
                    <span className="font-medium text-[oklch(0.448_0.228_27.3)]">
                      {t("introCount", { count: feed.requests.length })}
                    </span>
                  )}
            </p>
          </div>

          {/* KPIs — real numbers only */}
          <div className="mb-8 grid grid-cols-2 gap-3 lg:max-w-md">
            {[
              { icon: TrendingUp, label: t("openRequests"), value: feed.requests.length },
              { icon: Send, label: t("offersSent"), value: feed.offersSent },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white p-5">
                <Icon className="mb-3 h-4 w-4 text-[oklch(0.600_0.006_27.0)]" />
                <div className="text-[1.75rem] font-bold leading-none tabular-nums text-[oklch(0.112_0.012_27.0)]">{value}</div>
                <div className="mt-1 text-[12px] text-[oklch(0.560_0.006_27.0)]">{label}</div>
              </div>
            ))}
          </div>

          {feed.requests.length === 0 ? (
            <DashboardNotice
              title={t("noRequestsTitle")}
              body={t("noRequestsBody")}
            />
          ) : (
            <div>
              <h2 className="mb-3 text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)]">{t("buyerRequests")}</h2>
              <div className="space-y-2.5">
                {feed.requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white p-5 transition-all hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)]">
                            {req.brands.length ? labelList(req.brands, "") : labelList(req.body_types, t("anyVehicle"))}
                          </p>
                          {req.answered && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              {t("answered")}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[oklch(0.560_0.006_27.0)]">
                          <span>{chf(req.budget_min)} – {chf(req.budget_max)}</span>
                          {req.year_min && req.year_max && <span>· {req.year_min}–{req.year_max}</span>}
                          <span>· {labelList(req.fuel_types, t("anyFuel"))}</span>
                          {req.mileage_max && <span>· {t("maxKm", { km: new Intl.NumberFormat("de-CH").format(req.mileage_max) })}</span>}
                          {req.canton && <span>· {req.canton}</span>}
                          <span className="flex items-center gap-1">
                            · <Clock className="h-3 w-3" /> {timeAgo(req.created_at)}
                          </span>
                        </div>
                      </div>
                      {!req.answered && (
                        <button
                          onClick={() => setOpenForm(openForm === req.id ? null : req.id)}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-[oklch(0.448_0.228_27.3)] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[oklch(0.400_0.218_27.3)]"
                        >
                          <Send className="h-3 w-3" />
                          {t("sendOffer")}
                        </button>
                      )}
                    </div>
                    {openForm === req.id && (
                      <OfferForm
                        request={req}
                        onClose={() => setOpenForm(null)}
                        onSent={() => {
                          setOpenForm(null);
                          load();
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
