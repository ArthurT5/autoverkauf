"use client";

import { motion } from "framer-motion";
import { Plus, Bell, ChevronRight, Clock, Car, MessageSquare, TrendingUp, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";

const ease = [0.16, 1, 0.3, 1] as const;

const REQUESTS = [
  {
    id: 1,
    label: "BMW 5 Series",
    spec: "2019–2022 · Diesel or Hybrid",
    budget: "CHF 35,000 – 45,000",
    status: "active",
    offers: 5,
    newOffers: 3,
    age: "2 days ago",
  },
  {
    id: 2,
    label: "Mercedes GLC",
    spec: "Any year · Any fuel",
    budget: "CHF 45,000 – 65,000",
    status: "active",
    offers: 2,
    newOffers: 2,
    age: "4 days ago",
  },
];

const OFFERS = [
  { id: 1, dealer: "BMW Zürich AG", car: "530d xDrive 2021", price: "CHF 38,500", km: "62,000 km", isNew: true, for: "BMW 5 Series" },
  { id: 2, dealer: "AutoCenter Winterthur", car: "520i M Sport 2020", price: "CHF 35,900", km: "78,000 km", isNew: true, for: "BMW 5 Series" },
  { id: 3, dealer: "Premium Cars Bern", car: "530e Hybrid 2022", price: "CHF 43,200", km: "31,000 km", isNew: true, for: "BMW 5 Series" },
  { id: 4, dealer: "Mercedes Basel", car: "GLC 300 4MATIC 2021", price: "CHF 52,900", km: "28,000 km", isNew: true, for: "Mercedes GLC" },
];

export default function BuyerDashboard() {
  return (
    <div className="min-h-screen bg-[oklch(0.972_0.003_27.0)]">
      {/* Header */}
      <header className="bg-white border-b border-[oklch(0.916_0.004_27.0)] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-[oklch(0.840_0.004_27.0)] text-[14px]">/</span>
            <span className="text-[14px] text-[oklch(0.460_0.008_27.0)]">My dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[oklch(0.500_0.006_27.0)] hover:text-[oklch(0.200_0.010_27.0)] transition-colors cursor-pointer rounded-lg hover:bg-[oklch(0.965_0.003_27.0)]">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[oklch(0.448_0.228_27.3)]" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[oklch(0.448_0.228_27.3)] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer">M</div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome row */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[1.5rem] font-bold text-[oklch(0.112_0.012_27.0)] tracking-tight">
              Good morning, Markus
            </h1>
            <p className="text-[14px] text-[oklch(0.500_0.008_27.0)] mt-0.5">
              You have{" "}
              <span className="font-semibold text-[oklch(0.448_0.228_27.3)]">5 new offers</span>{" "}
              waiting for you.
            </p>
          </div>
          <a
            href="/buyer/requests/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-semibold rounded-xl hover:bg-[oklch(0.400_0.218_27.3)] transition-colors shadow-[0_2px_8px_-2px_oklch(0.448_0.228_27.3/0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            New request
          </a>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Car, label: "Active requests", value: "2", trend: null },
            { icon: Bell, label: "New offers", value: "5", trend: "+5 today" },
            { icon: MessageSquare, label: "Unread messages", value: "3", trend: null },
            { icon: TrendingUp, label: "Saved offers", value: "8", trend: null },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease }}
                className="bg-white rounded-2xl p-5 border border-[oklch(0.916_0.004_27.0)] hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-[oklch(0.600_0.006_27.0)]" />
                  {stat.trend && (
                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="text-[1.75rem] font-bold text-[oklch(0.112_0.012_27.0)] tabular-nums leading-none">{stat.value}</div>
                <div className="text-[12px] text-[oklch(0.560_0.006_27.0)] mt-1">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* My requests */}
          <div>
            <h2 className="text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)] mb-3">My requests</h2>
            <div className="space-y-2.5">
              {REQUESTS.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, ease }}
                  className="bg-white rounded-2xl p-5 border border-[oklch(0.916_0.004_27.0)] hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)] group-hover:text-[oklch(0.448_0.228_27.3)] transition-colors">{req.label}</p>
                      <p className="text-[12px] text-[oklch(0.560_0.006_27.0)] mt-0.5">{req.spec}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      Active
                    </span>
                  </div>
                  <p className="text-[12px] font-medium text-[oklch(0.350_0.010_27.0)] mb-3">{req.budget}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[12px] text-[oklch(0.580_0.006_27.0)]">
                      <Clock className="w-3 h-3" />
                      {req.age}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] font-bold text-[oklch(0.448_0.228_27.3)]">
                      {req.newOffers} new · {req.offers} total
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}

              <a
                href="/buyer/requests/new"
                className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl border-2 border-dashed border-[oklch(0.916_0.004_27.0)] text-[13px] text-[oklch(0.560_0.006_27.0)] hover:border-[oklch(0.448_0.228_27.3)]/40 hover:text-[oklch(0.448_0.228_27.3)] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create new request
              </a>
            </div>
          </div>

          {/* Offers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-[oklch(0.200_0.010_27.0)]">Latest offers</h2>
              <button className="flex items-center gap-1 text-[12px] text-[oklch(0.448_0.228_27.3)] font-medium cursor-pointer hover:underline">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5">
              {OFFERS.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.07, ease }}
                  className="bg-white rounded-2xl p-5 border border-[oklch(0.916_0.004_27.0)] hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[12px] text-[oklch(0.560_0.006_27.0)]">{offer.dealer}</p>
                      <p className="text-[15px] font-semibold text-[oklch(0.150_0.012_27.0)] group-hover:text-[oklch(0.112_0.012_27.0)] transition-colors">{offer.car}</p>
                    </div>
                    {offer.isNew && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[oklch(0.448_0.228_27.3)] text-white shrink-0">NEW</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[1.375rem] font-bold text-[oklch(0.448_0.228_27.3)] tabular-nums">{offer.price}</span>
                    <span className="text-[12px] text-[oklch(0.560_0.006_27.0)]">{offer.km}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[oklch(0.940_0.003_27.0)] flex items-center justify-between">
                    <span className="text-[11px] text-[oklch(0.600_0.006_27.0)]">For: {offer.for}</span>
                    <button className="text-[12px] font-semibold text-[oklch(0.448_0.228_27.3)] hover:underline cursor-pointer">
                      View offer →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
