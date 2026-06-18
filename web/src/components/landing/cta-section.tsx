"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-[oklch(0.112_0.012_27.0)] rounded-3xl px-8 py-16 lg:px-20 lg:py-20 overflow-hidden"
        >
          {/* Subtle red glow */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-[oklch(0.448_0.228_27.3)] opacity-[0.12] blur-3xl pointer-events-none" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              className="text-[oklch(0.448_0.228_27.3)] text-[12px] font-semibold tracking-widest uppercase mb-5"
            >
              Get started today
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white tracking-[-0.03em] leading-[1.1]"
            >
              Ready to find your next car?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 }}
              className="mt-5 text-[oklch(0.660_0.004_27.0)] text-[1.05rem] max-w-md mx-auto leading-relaxed"
            >
              Describe what you want once. Sit back. Let verified Swiss
              dealerships send you their best offers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.22 }}
              className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <a
                href="/buyer/requests/new"
                className="btn-lift inline-flex items-center justify-center gap-2 px-7 py-4 bg-[oklch(0.448_0.228_27.3)] text-white text-[14px] font-semibold rounded-xl hover:bg-[oklch(0.400_0.218_27.3)] transition-colors shadow-[0_4px_24px_-4px_rgba(180,40,40,0.5)]"
              >
                Find my car — it's free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:dealers@autoverkauf.ch"
                className="btn-lift inline-flex items-center justify-center px-7 py-4 text-white text-[14px] font-medium rounded-xl border border-white/15 hover:bg-white/10 transition-colors"
              >
                Register as a dealer
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.32 }}
              className="mt-6 text-[12px] text-[oklch(0.480_0.004_27.0)]"
            >
              No commitment. No spam. Cancel any time.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
