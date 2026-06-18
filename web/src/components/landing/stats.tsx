"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PILLARS = [
  {
    number: "01",
    title: "Free for buyers",
    body: "You never pay a commission or platform fee. Dealers pay to access the platform — you don't.",
  },
  {
    number: "02",
    title: "Verified dealerships only",
    body: "Every dealer is manually reviewed and approved before they can contact buyers on AutoVerkauf.",
  },
  {
    number: "03",
    title: "You stay in control",
    body: "Dealers can't call you or email you outside the platform until you choose to share your details.",
  },
];

export function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-[oklch(0.972_0.003_27.0)] py-24 lg:py-32 border-y border-[oklch(0.916_0.004_27.0)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-xl mb-16" ref={ref}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="text-[oklch(0.448_0.228_27.3)] text-[12px] font-semibold tracking-widest uppercase mb-4"
          >
            Why AutoVerkauf
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.06 }}
            className="text-[clamp(1.8rem,3.5vw,2.75rem)] font-bold tracking-[-0.03em] text-[oklch(0.112_0.012_27.0)] leading-[1.15]"
          >
            Built around the buyer.
            <br />
            Not the dealer.
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[oklch(0.916_0.004_27.0)] rounded-2xl overflow-hidden">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white p-8 lg:p-10"
            >
              <span className="text-[11px] font-bold tracking-widest text-[oklch(0.680_0.004_27.0)]">
                {p.number}
              </span>
              <h3 className="mt-4 text-[1.25rem] font-bold text-[oklch(0.112_0.012_27.0)] tracking-tight">
                {p.title}
              </h3>
              <p className="mt-3 text-[14px] text-[oklch(0.480_0.008_27.0)] leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
