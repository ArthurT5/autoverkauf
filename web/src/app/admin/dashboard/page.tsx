"use client";

import { useEffect, useState } from "react";
import { Users, Building2, FileText, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { DashboardShell, DashboardNotice } from "@/components/dashboard/shell";
import { timeAgo } from "@/lib/format";

type Overview = {
  stats: {
    buyers: number;
    dealersApproved: number;
    dealersPending: number;
    activeRequests: number;
    offersTotal: number;
  };
  pendingDealers: {
    id: string;
    company_name: string;
    canton: string | null;
    website: string | null;
    created_at: string;
  }[];
};

export default function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations("dash.admin");
  const tD = useTranslations("dash");
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/overview")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? tD("wrong"));
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  async function act(dealerId: string, action: "approve" | "reject") {
    setActing(dealerId);
    try {
      const res = await fetch("/api/admin/overview", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId, action }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? tD("wrong"));
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : tD("wrong"));
    } finally {
      setActing(null);
    }
  }

  const KPIS = data
    ? [
        { icon: Users, label: t("buyers"), value: data.stats.buyers },
        { icon: Building2, label: t("verifiedDealers"), value: data.stats.dealersApproved },
        { icon: FileText, label: t("activeRequests"), value: data.stats.activeRequests },
        { icon: TrendingUp, label: t("offersSent"), value: data.stats.offersTotal },
      ]
    : [];

  return (
    <DashboardShell section={t("section")} initial="A">
      <div className="mb-8">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[oklch(0.112_0.012_27.0)]">
          {t("title")}
        </h1>
        <p className="mt-0.5 text-[14px] text-[oklch(0.500_0.010_27.0)]">
          {new Date().toLocaleDateString(`${locale}-CH`, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {error && <DashboardNotice title={tD("wrong")} body={error} />}

      {!error && data === null && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-[oklch(0.920_0.006_27.0)] bg-white" />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {KPIS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-[oklch(0.920_0.006_27.0)] bg-white p-5">
                <Icon className="mb-3 h-4 w-4 text-[oklch(0.600_0.006_27.0)]" />
                <div className="text-[2rem] font-bold tabular-nums text-[oklch(0.112_0.012_27.0)]">{value}</div>
                <div className="mt-0.5 text-[12px] text-[oklch(0.550_0.010_27.0)]">{label}</div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[oklch(0.112_0.012_27.0)]">
                {t("pendingTitle")}
              </h2>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-700">
                {t("pendingCount", { count: data.stats.dealersPending })}
              </span>
            </div>

            {data.pendingDealers.length === 0 ? (
              <DashboardNotice title={t("queueEmptyTitle")} body={t("queueEmptyBody")} />
            ) : (
              <div className="space-y-3">
                {data.pendingDealers.map((dealer) => (
                  <div key={dealer.id} className="rounded-2xl border border-[oklch(0.920_0.006_27.0)] bg-white p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[oklch(0.150_0.012_27.0)]">
                          {dealer.company_name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[oklch(0.550_0.010_27.0)]">
                          {dealer.canton && <>{t("canton", { canton: dealer.canton })} · </>}
                          <Clock className="h-3 w-3" /> {timeAgo(dealer.created_at)}
                        </p>
                      </div>
                      {dealer.website && (
                        <a
                          href={dealer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[12px] font-medium text-[oklch(0.448_0.228_27.3)] hover:underline"
                        >
                          {t("website")}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(dealer.id, "approve")}
                        disabled={acting === dealer.id}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-[12px] font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("approve")}
                      </button>
                      <button
                        onClick={() => act(dealer.id, "reject")}
                        disabled={acting === dealer.id}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[oklch(0.920_0.006_27.0)] py-2 text-[12px] font-medium text-[oklch(0.400_0.010_27.0)] transition-colors hover:bg-[oklch(0.960_0.005_27.0)] disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("reject")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
