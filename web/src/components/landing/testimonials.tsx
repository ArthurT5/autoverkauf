"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="testimonials" className="bg-white py-28 lg:py-36">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-[oklch(0.448_0.228_27.3)] text-[13px] font-semibold tracking-widest uppercase mb-4"
        >
          Early access
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05 }}
          className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)]"
          style={{ textWrap: "balance" } as React.CSSProperties}
        >
          Be the first to use AutoVerkauf.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="mt-4 text-[1.05rem] text-[oklch(0.450_0.010_27.0)] max-w-xl mx-auto leading-relaxed"
        >
          We're launching soon across Switzerland. Join the waitlist and you'll
          be among the first buyers to receive offers from verified dealerships.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.18 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <a
            href="/buyer/requests/new"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[oklch(0.448_0.228_27.3)] text-white text-[15px] font-semibold rounded-xl hover:bg-[oklch(0.400_0.218_27.3)] transition-all duration-200 hover:shadow-lg hover:shadow-[oklch(0.448_0.228_27.3)]/20 active:scale-[0.98]"
          >
            Get early access
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="mailto:dealers@autoverkauf.ch"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[oklch(0.960_0.005_27.0)] text-[oklch(0.250_0.012_27.0)] text-[15px] font-medium rounded-xl hover:bg-[oklch(0.940_0.008_27.0)] transition-colors duration-200"
          >
            Register as a dealer
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.28 }}
          className="mt-6 text-[12px] text-[oklch(0.600_0.010_27.0)]"
        >
          No commitment. No spam. Cancel any time.
        </motion.p>
      </div>
    </section>
  );
}
