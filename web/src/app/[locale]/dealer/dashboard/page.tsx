"use client";

import { motion } from "framer-motion";
import { Bell, TrendingUp, Send, Eye, Filter, ArrowUpRight, CheckCircle } from "lucide-react";
import { Logo } from "@/components/logo";

const ease = [0.16, 1, 0.3, 1] as const;

const MATCH_STYLES: Record<string, string> = {
  High: "bg-green-50 text-green-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-[oklch(0.960_0.003_27.0)] text-[oklch(0.500_0.008_27.0)]",
};

const REQUESTS = [
  { id: 1, budget: "CHF 35,000 – 45,000", type: "BMW 5 Series", fuel: "Petrol / Diesel", year: "2019–2022", km: "max 80k km", location: "Zürich", age: "2h ago", match: "High" },
  { id: 2, budget: "CHF 45,000 – 65,000", type: "Mercedes GLC", fuel: "Any", year: "Any", km: "max 50k km", location: "Bern", age: "4h ago", match: "High" },
  { id: 3, budget: "CHF 20,000 – 30,000", type: "VW Golf / Passat", fuel: "Diesel", year: "2018–2021", km: "max 100k km", location: "Basel", age: "6h ago", match: "Medium" },
  { id: 4, budget: "CHF 60,000 – 90,000", type: "Porsche Cayenne", fuel: "Hybrid / PHEV", year: "2020+", km: "max 40k km", location: "Zürich", age: "8h ago", match: "Low" },
];

export default function DealerDashboard() {
  return (
    <div className="min-h-screen bg-[oklch(0.972_0.003_27.0)]">
      {/* Header */}
      <header className="bg-white border-b border-[oklch(0.916_0.004_27.0)] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-[oklch(0.840_0.004_27.0)] text-[14px]">/</span>
            <span className="text-[14px] text-[oklch(0.460_0.008_27.0)]">Dealer portal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              Verified
            </span>
            <button className="relative p-2 text-[oklch(0.500_0.006_27.0)] hover:text-[oklch(0.200_0.010_27.0)] transition-colors cursor-pointer rounded-lg hover:bg-[oklch(0.965_0.003_27.0)]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[oklch(0.448_0.228_27.3)]" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[oklch(0.112_0.012_27.0)] flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">BM</div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-[1.5rem] font-bold text-[oklch(0.112_0.012_27.0)] tracking-tight">BMW Zürich AG</h1>
          <p className="text-[14px] text-[oklch(0.500_0.008_27.0)] mt-0.5">
            <span className="font-semibold text-[oklch(0.448_0.228_27.3)]">4 buyer requests</span> match your inventory today.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { icon: TrendingUp, label: "New requests", value: "4", sub: "Today" },
            { icon: Send, label: "Offers sent", value: "—", sub: "This month" },
            { icon: Eye, label: "Offer views", value: "—", sub: "This month" },
            { icon: CheckCircle, label: "Acceptance rate", value: "—", sub: "All time" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease }}
                className="bg-white rounded-2xl p-5 border border-[oklch(0.916_0.004_27.0)] hover:shadow-sm transition-shadow"
              >
                <Icon className="w-4 h-4 text-[oklch(0.600_0.006_27.0)] mb-3" />
                <div className="text-[1.75rem] font-bold text-[oklch(0.112_0.012_27.0)] tabular-nums leading-none">{kpi.value}</div>
                <div className="text-[12px] text-[oklch(0.560_0.006_27.0)] mt-1">{kpi.label}</div>
                <div className="text-[11px] text-[oklch(0.680_0.004_27.0)] mt-0.5">{kpi.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Buyer requests */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)]">Buyer requests for you</h2>
            <button className="flex items-center gap-1.5 text-[12px] text-[oklch(0.500_0.008_27.0)] hover:text-[oklch(0.200_0.010_27.0)] transition-colors cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>

          <div className="space-y-2.5">
            {REQUESTS.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, ease }}
                className="bg-white rounded-2xl p-5 border border-[oklch(0.916_0.004_27.0)] hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)]">{req.type}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${MATCH_STYLES[req.match]}`}>
                        {req.match} match
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[oklch(0.560_0.006_27.0)]">
                      <span>{req.budget}</span>
                      <span>·</span>
                      <span>{req.year}</span>
                      <span>·</span>
                      <span>{req.fuel}</span>
                      <span>·</span>
                      <span>{req.km}</span>
                      <span>·</span>
                      <span>📍 {req.location}</span>
                      <span>·</span>
                      <span>{req.age}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="px-4 py-2 text-[12px] font-medium border border-[oklch(0.916_0.004_27.0)] rounded-lg hover:bg-[oklch(0.965_0.003_27.0)] transition-colors cursor-pointer text-[oklch(0.400_0.008_27.0)]">
                      View
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-[oklch(0.448_0.228_27.3)] text-white rounded-lg hover:bg-[oklch(0.400_0.218_27.3)] transition-colors cursor-pointer">
                      <Send className="w-3 h-3" />
                      Send offer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="mt-4 w-full py-3.5 text-[13px] text-[oklch(0.500_0.008_27.0)] hover:text-[oklch(0.448_0.228_27.3)] flex items-center justify-center gap-1 transition-colors cursor-pointer">
            Show all requests <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
