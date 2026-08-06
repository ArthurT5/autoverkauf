"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ChevronRight, Clock, Car, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardShell, DashboardNotice } from "@/components/dashboard/shell";
import { chf, timeAgo, labelList } from "@/lib/format";

type VehicleRequest = {
  id: string;
  budget_min: number;
  budget_max: number;
  body_types: string[];
  brands: string[];
  year_min: number | null;
  year_max: number | null;
  fuel_types: string[];
  canton: string | null;
  created_at: string;
  offers: { count: number }[];
};

type Offer = {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  status: string;
  created_at: string;
  dealers: { company_name: string } | null;
};

export default function BuyerDashboard() {
  const t = useTranslations("dash.buyer");
  const tD = useTranslations("dash");
  const [userName, setUserName] = useState<string | null>(null);
  const [requests, setRequests] = useState<VehicleRequest[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [offersError, setOffersError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setUserName(s?.user?.name ?? null))
      .catch(() => {});
    fetch("/api/requests")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? tD("wrong"));
        return r.json();
      })
      .then((d) => {
        setRequests(d.requests ?? []);
        if (d.requests?.length) setSelected(d.requests[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  const loadOffers = useCallback((requestId: string) => {
    setOffers(null);
    setOffersError("");
    fetch(`/api/offers?requestId=${requestId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? t("offersFailed"));
        return r.json();
      })
      .then((d) => setOffers(d.offers ?? []))
      .catch((e) => setOffersError(e.message));
  }, []);

  useEffect(() => {
    if (selected) loadOffers(selected);
  }, [selected, loadOffers]);

  const name = userName?.split(" ")[0];
  const totalOffers = requests?.reduce((n, r) => n + (r.offers?.[0]?.count ?? 0), 0);

  const newRequestButton = (
    <a
      href="/buyer/requests/new"
      className="inline-flex items-center gap-1.5 rounded-xl bg-[oklch(0.448_0.228_27.3)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_-2px_oklch(0.448_0.228_27.3/0.4)] transition-colors hover:bg-[oklch(0.400_0.218_27.3)]"
    >
      <Plus className="h-3.5 w-3.5" />
      {t("newRequest")}
    </a>
  );

  return (
    <DashboardShell section={t("section")} initial={name?.[0]?.toUpperCase()}>
      {/* Welcome row */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-bold tracking-tight text-[oklch(0.112_0.012_27.0)]">
            {name ? t("welcomeName", { name }) : t("welcome")}
          </h1>
          <p className="mt-0.5 text-[14px] text-[oklch(0.500_0.008_27.0)]">
            {requests === null
              ? t("loadingIntro")
              : requests.length === 0
                ? t("introEmpty")
                : totalOffers === 0
                  ? t("introReviewing")
                  : (
                      <span className="font-medium text-[oklch(0.448_0.228_27.3)]">
                        {t("introOffers", { count: totalOffers ?? 0 })}
                      </span>
                    )}
          </p>
        </div>
        {newRequestButton}
      </div>

      {/* KPI row — only real numbers */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:max-w-md">
        {[
          { icon: Car, label: t("activeRequests"), value: requests?.length },
          { icon: Bell, label: t("offersReceived"), value: totalOffers },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white p-5"
          >
            <Icon className="mb-3 h-4 w-4 text-[oklch(0.600_0.006_27.0)]" />
            <div className="text-[1.75rem] font-bold leading-none tabular-nums text-[oklch(0.112_0.012_27.0)]">
              {value ?? "–"}
            </div>
            <div className="mt-1 text-[12px] text-[oklch(0.560_0.006_27.0)]">{label}</div>
          </div>
        ))}
      </div>

      {error && (
        <DashboardNotice title={tD("wrong")} body={error} />
      )}

      {!error && requests !== null && requests.length === 0 && (
        <DashboardNotice
          title={t("noRequestsTitle")}
          body={t("noRequestsBody")}
          action={newRequestButton}
        />
      )}

      {!error && requests !== null && requests.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Requests */}
          <div>
            <h2 className="mb-3 text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)]">{t("myRequests")}</h2>
            <div className="space-y-2.5">
              {requests.map((req) => {
                const count = req.offers?.[0]?.count ?? 0;
                const active = req.id === selected;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelected(req.id)}
                    className={[
                      "group w-full cursor-pointer rounded-2xl border bg-white p-5 text-left transition-all",
                      active
                        ? "border-[oklch(0.448_0.228_27.3)]/50 shadow-sm"
                        : "border-[oklch(0.916_0.004_27.0)] hover:shadow-sm",
                    ].join(" ")}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)]">
                          {req.brands.length ? `${labelList(req.brands, "")} · ${labelList(req.body_types, t("anyVehicle"))}` : labelList(req.body_types, t("anyVehicle"))}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[oklch(0.560_0.006_27.0)]">
                          {req.year_min && req.year_max ? `${req.year_min}–${req.year_max} · ` : ""}
                          {labelList(req.fuel_types, t("anyFuel"))}
                          {req.canton ? ` · ${req.canton}` : ""}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        <span className="h-1 w-1 rounded-full bg-green-500" />
                        {t("active")}
                      </span>
                    </div>
                    <p className="mb-3 text-[12px] font-medium text-[oklch(0.350_0.010_27.0)]">
                      {chf(req.budget_min)} – {chf(req.budget_max)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[12px] text-[oklch(0.580_0.006_27.0)]">
                        <Clock className="h-3 w-3" />
                        {timeAgo(req.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-[13px] font-bold text-[oklch(0.448_0.228_27.3)]">
                        {t("offersCount", { count })}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}

              <a
                href="/buyer/requests/new"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[oklch(0.916_0.004_27.0)] py-5 text-[13px] text-[oklch(0.560_0.006_27.0)] transition-colors hover:border-[oklch(0.448_0.228_27.3)]/40 hover:text-[oklch(0.448_0.228_27.3)]"
              >
                <Plus className="h-4 w-4" />
                {t("createNew")}
              </a>
            </div>
          </div>

          {/* Offers for the selected request */}
          <div>
            <h2 className="mb-3 text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)]">{t("offersTitle")}</h2>
            {offersError && <DashboardNotice title={t("offersFailed")} body={offersError} />}
            {!offersError && offers === null && (
              <div className="space-y-2.5">
                {[0, 1].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white" />
                ))}
              </div>
            )}
            {!offersError && offers !== null && offers.length === 0 && (
              <DashboardNotice
                title={t("noOffersTitle")}
                body={t("noOffersBody")}
              />
            )}
            {!offersError && offers !== null && offers.length > 0 && (
              <div className="space-y-2.5">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-[oklch(0.916_0.004_27.0)] bg-white p-5 transition-all hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] text-[oklch(0.560_0.006_27.0)]">
                          {offer.dealers?.company_name ?? t("verifiedDealer")}
                        </p>
                        <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)]">
                          {offer.make} {offer.model} · {offer.year}
                        </p>
                      </div>
                      {offer.status === "PENDING" && (
                        <span className="shrink-0 rounded-full bg-[oklch(0.448_0.228_27.3)] px-2 py-0.5 text-[10px] font-bold text-white">
                          {t("isNew")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[1.375rem] font-bold tabular-nums text-[oklch(0.448_0.228_27.3)]">
                        {chf(offer.price)}
                      </span>
                      <span className="text-[12px] text-[oklch(0.560_0.006_27.0)]">
                        {new Intl.NumberFormat("de-CH").format(offer.mileage)} km · {timeAgo(offer.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
