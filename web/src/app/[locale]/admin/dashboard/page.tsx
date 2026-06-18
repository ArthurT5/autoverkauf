"use client";

import { motion } from "framer-motion";
import { Users, Building2, FileText, AlertTriangle, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Logo } from "@/components/logo";

const PENDING_DEALERS = [
  { name: "AutoCenter Luzern AG", canton: "LU", submitted: "2h ago", docs: "Complete" },
  { name: "Premium Cars Winterthur", canton: "ZH", submitted: "5h ago", docs: "Complete" },
  { name: "Garage du Lac SA", canton: "VD", submitted: "1d ago", docs: "Pending" },
];

const RECENT_ACTIVITY = [
  { type: "dealer_approved", text: "BMW Zürich AG approved", time: "10m ago" },
  { type: "request_created", text: "New buyer request: Mercedes GLC, CHF 50k", time: "25m ago" },
  { type: "offer_accepted", text: "Offer accepted: BMW 530d, CHF 38,500", time: "1h ago" },
  { type: "dealer_flagged", text: "Report on AutoGarage Bern reviewed", time: "2h ago" },
  { type: "user_registered", text: "124 new buyer registrations today", time: "Today" },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  dealer_approved: <CheckCircle className="w-4 h-4 text-green-600" />,
  request_created: <FileText className="w-4 h-4 text-blue-600" />,
  offer_accepted: <TrendingUp className="w-4 h-4 text-[oklch(0.448_0.228_27.3)]" />,
  dealer_flagged: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  user_registered: <Users className="w-4 h-4 text-purple-600" />,
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[oklch(0.977_0.005_27.0)]">
      {/* Header */}
      <header className="bg-[oklch(0.112_0.012_27.0)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo dark />
            <span className="sr-only">AutoVerkauf</span>
            <span className="text-white/30">/</span>
            <span className="text-[14px] text-white/60">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[oklch(0.448_0.228_27.3)] text-white font-semibold">Super Admin</span>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[11px] font-bold">A</div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[1.75rem] font-bold text-[oklch(0.112_0.012_27.0)] tracking-tight">Platform overview</h1>
          <p className="text-[oklch(0.500_0.010_27.0)] text-[14px] mt-0.5">Wednesday, 18 June 2026</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total buyers", value: "—", sub: "Live at launch", color: "text-blue-600" },
            { icon: Building2, label: "Verified dealers", value: "—", sub: "3 pending approval", color: "text-green-600" },
            { icon: FileText, label: "Active requests", value: "—", sub: "Live at launch", color: "text-purple-600" },
            { icon: TrendingUp, label: "Offers sent today", value: "—", sub: "Live at launch", color: "text-[oklch(0.448_0.228_27.3)]" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-5 border border-[oklch(0.920_0.006_27.0)]"
              >
                <Icon className={`w-4 h-4 mb-3 ${kpi.color}`} />
                <div className="text-[2rem] font-bold text-[oklch(0.112_0.012_27.0)] tabular-nums">{kpi.value}</div>
                <div className="text-[12px] text-[oklch(0.550_0.010_27.0)] mt-0.5">{kpi.label}</div>
                <div className="text-[11px] text-[oklch(0.700_0.005_27.0)] mt-1">{kpi.sub}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          {/* Pending dealer verifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[oklch(0.112_0.012_27.0)]">Pending dealer verifications</h2>
              <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {PENDING_DEALERS.length} pending
              </span>
            </div>
            <div className="space-y-3">
              {PENDING_DEALERS.map((dealer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="bg-white rounded-2xl p-5 border border-[oklch(0.920_0.006_27.0)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[oklch(0.150_0.012_27.0)]">{dealer.name}</p>
                      <p className="text-[12px] text-[oklch(0.550_0.010_27.0)]">Canton {dealer.canton} · {dealer.submitted}</p>
                    </div>
                    <span className={[
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      dealer.docs === "Complete" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700",
                    ].join(" ")}>
                      Docs: {dealer.docs}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium border border-[oklch(0.920_0.006_27.0)] rounded-lg hover:bg-[oklch(0.960_0.005_27.0)] transition-colors cursor-pointer text-[oklch(0.400_0.010_27.0)]">
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button className="px-3 py-2 text-[12px] text-[oklch(0.500_0.010_27.0)] border border-[oklch(0.920_0.006_27.0)] rounded-lg hover:bg-[oklch(0.960_0.005_27.0)] cursor-pointer transition-colors">
                      Review →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div>
            <h2 className="text-[15px] font-semibold text-[oklch(0.112_0.012_27.0)] mb-4">Recent activity</h2>
            <div className="bg-white rounded-2xl border border-[oklch(0.920_0.006_27.0)] overflow-hidden">
              {RECENT_ACTIVITY.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="flex items-start gap-3 px-5 py-4 border-b border-[oklch(0.940_0.005_27.0)] last:border-0"
                >
                  <div className="mt-0.5 shrink-0">{ACTIVITY_ICONS[item.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[oklch(0.250_0.010_27.0)]">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[oklch(0.650_0.005_27.0)] shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Manage buyers", href: "/admin/buyers" },
                { label: "Manage dealers", href: "/admin/dealers" },
                { label: "Analytics", href: "/admin/analytics" },
                { label: "Settings", href: "/admin/settings" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-center py-3 bg-white text-[13px] font-medium text-[oklch(0.300_0.010_27.0)] rounded-xl border border-[oklch(0.920_0.006_27.0)] hover:border-[oklch(0.448_0.228_27.3)]/50 hover:text-[oklch(0.448_0.228_27.3)] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
