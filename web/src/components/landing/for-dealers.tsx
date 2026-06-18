"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, BarChart3, Shield } from "lucide-react";

const BENEFITS = [
  {
    icon: Users,
    title: "Pre-qualified buyers",
    description: "Every buyer has already defined their budget and requirements. No tyre-kickers.",
  },
  {
    icon: TrendingUp,
    title: "Compete on quality",
    description: "Your vehicle, price, and service speak for themselves — not your ad spend.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    description: "Track offer acceptance rates, response times, and revenue through your dealer dashboard.",
  },
  {
    icon: Shield,
    title: "Verified platform",
    description: "Only verified, licensed Swiss dealerships are approved. Your reputation is protected.",
  },
];

export function ForDealers() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="dealers" className="bg-[oklch(0.977_0.005_27.0)] py-28 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left */}
          <div ref={ref}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[oklch(0.448_0.228_27.3)] text-[13px] font-semibold tracking-widest uppercase mb-4"
            >
              For dealerships
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)] leading-[1.15]"
            >
              Reach buyers who
              <br />
              already want your car.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 text-[1.05rem] text-[oklch(0.450_0.010_27.0)] leading-relaxed"
            >
              Instead of spending on ads and waiting for leads, you receive direct
              requests from buyers who have already decided what they want and what
              they can spend. Just send your best offer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="/dealer/signup"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-semibold rounded-xl hover:bg-[oklch(0.400_0.218_27.3)] transition-colors"
              >
                Apply as a dealer →
              </a>
              <a
                href="/dealer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-[oklch(0.250_0.012_27.0)] text-[14px] font-medium rounded-xl border border-[oklch(0.920_0.006_27.0)] hover:bg-[oklch(0.960_0.005_27.0)] transition-colors"
              >
                View demo dashboard
              </a>
            </motion.div>
          </div>

          {/* Right: benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl p-6 border border-[oklch(0.920_0.006_27.0)] hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.960_0.005_27.0)] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[oklch(0.448_0.228_27.3)]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[oklch(0.112_0.012_27.0)] mb-1.5">
                    {b.title}
                  </h3>
                  <p className="text-[13px] text-[oklch(0.500_0.010_27.0)] leading-relaxed">
                    {b.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
