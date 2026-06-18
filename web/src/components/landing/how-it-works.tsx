"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, Bell, Inbox, Car } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    number: "01",
    title: "Describe your car",
    description:
      "Tell us your budget, preferred brands, body type, fuel, and the features that matter. Takes under 3 minutes.",
    detail: "Our guided form makes it effortless. No account needed to start.",
  },
  {
    icon: Bell,
    number: "02",
    title: "Dealers are notified",
    description:
      "Your request reaches all verified Swiss dealerships that carry matching inventory — automatically.",
    detail: "Verified dealerships across all 26 cantons.",
  },
  {
    icon: Inbox,
    number: "03",
    title: "Offers arrive",
    description:
      "Dealers send you vehicle offers directly. Each offer includes price, mileage, photos, and a personal message.",
    detail: "Each offer lands directly in your dashboard.",
  },
  {
    icon: Car,
    number: "04",
    title: "You choose",
    description:
      "Compare offers side by side, ask questions, and pick your favourite. Then contact the dealer directly.",
    detail: "No platform fees. No commission. Just the best deal.",
  },
];

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const Icon = step.icon;

  return (
    <motion.div ref={ref} style={{ opacity, y }} className="flex gap-8 items-start">
      {/* Left: number + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-[oklch(0.448_0.228_27.3)] flex items-center justify-center shadow-lg shadow-[oklch(0.448_0.228_27.3)]/20">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {index < STEPS.length - 1 && (
          <div className="w-px flex-1 min-h-[60px] bg-gradient-to-b from-[oklch(0.448_0.228_27.3)]/30 to-transparent mt-4" />
        )}
      </div>

      {/* Right: content */}
      <div className="pb-16">
        <span className="text-[11px] font-bold tracking-widest text-[oklch(0.600_0.015_27.0)] uppercase">
          {step.number}
        </span>
        <h3 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[oklch(0.112_0.012_27.0)]">
          {step.title}
        </h3>
        <p className="mt-3 text-[1.05rem] text-[oklch(0.400_0.010_27.0)] leading-relaxed max-w-lg">
          {step.description}
        </p>
        <p className="mt-3 text-[13px] text-[oklch(0.550_0.015_27.0)] flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[oklch(0.448_0.228_27.3)]" />
          {step.detail}
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-28 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-20">
          <p className="text-[oklch(0.448_0.228_27.3)] text-[13px] font-semibold tracking-widest uppercase mb-4">
            How it works
          </p>
          <h2 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)] leading-[1.1]">
            The whole process,
            <br />
            in four steps.
          </h2>
          <p className="mt-5 text-[1.1rem] text-[oklch(0.450_0.010_27.0)] leading-relaxed">
            We reversed the traditional car buying process. Instead of you hunting through thousands
            of listings, dealers hunt for your perfect car.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Steps */}
          <div>
            {STEPS.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>

          {/* Sticky visual */}
          <div className="hidden lg:block lg:sticky lg:top-32 self-start">
            <div className="relative bg-[oklch(0.977_0.005_27.0)] rounded-3xl p-8 overflow-hidden">
              {/* Phone mockup with dashboard */}
              <div className="bg-white rounded-2xl shadow-xl border border-[oklch(0.920_0.006_27.0)] overflow-hidden">
                {/* Status bar */}
                <div className="bg-[oklch(0.448_0.228_27.3)] px-5 py-3 flex items-center justify-between">
                  <span className="text-white text-[13px] font-semibold">My Requests</span>
                  <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full">3 new offers</span>
                </div>
                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="text-[11px] font-medium text-[oklch(0.600_0.010_27.0)] uppercase tracking-wide mb-4">
                    Active request · BMW 5 Series
                  </div>
                  {[
                    { name: "BMW Zürich AG", price: "CHF 38,500", badge: "New" },
                    { name: "AutoCenter Basel", price: "CHF 37,200", badge: "New" },
                    { name: "Premium Cars Bern", price: "CHF 39,900", badge: "" },
                  ].map((offer, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[oklch(0.977_0.005_27.0)] border border-[oklch(0.940_0.005_27.0)]">
                      <div>
                        <p className="text-[13px] font-medium text-[oklch(0.200_0.010_27.0)]">{offer.name}</p>
                        <p className="text-[16px] font-bold text-[oklch(0.448_0.228_27.3)] tabular-nums">{offer.price}</p>
                      </div>
                      {offer.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[oklch(0.448_0.228_27.3)] text-white">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  <button className="w-full mt-2 py-3 bg-[oklch(0.448_0.228_27.3)] text-white text-[13px] font-semibold rounded-xl">
                    Compare all offers →
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-[oklch(0.448_0.228_27.3)]/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
