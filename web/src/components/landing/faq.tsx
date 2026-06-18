"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is AutoVerkauf free for buyers?",
    a: "Yes, completely. Buyers never pay anything on AutoVerkauf. We earn from dealership subscriptions, not from you.",
  },
  {
    q: "How do I know dealers are trustworthy?",
    a: "Every dealer on AutoVerkauf is manually verified. We check business registration, dealer licences, and customer reviews before approving any dealership. You can see each dealer's profile and rating.",
  },
  {
    q: "What happens if I don't like any offers?",
    a: "Nothing. You have zero obligation to accept any offer. Your request simply expires after 30 days. You can create a new request anytime.",
  },
  {
    q: "Can dealers contact me by phone?",
    a: "No. All communication stays within the AutoVerkauf platform until you choose to share your contact details directly with a specific dealer.",
  },
  {
    q: "How many offers can I expect?",
    a: "This depends on how specific your request is. Most buyers receive 3–12 offers within 48 hours. Requests for popular models like BMW 3 Series or VW Golf often receive 10+ offers within hours.",
  },
  {
    q: "What information do dealers see about me?",
    a: "Dealers only see your vehicle requirements and location canton. Your name, email, and phone number are never shared until you choose to contact a specific dealer.",
  },
  {
    q: "Can I submit a request for more than one car?",
    a: "Yes. You can have up to 3 active requests at the same time.",
  },
  {
    q: "How do I become a verified dealer?",
    a: "Click 'Apply as a dealer' and complete our verification form. We review applications within 2 business days.",
  },
];

function FAQItem({ item, index }: { item: typeof FAQS[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="border-b border-[oklch(0.920_0.006_27.0)] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-[15px] font-medium text-[oklch(0.150_0.012_27.0)] pr-8 group-hover:text-[oklch(0.448_0.228_27.3)] transition-colors">
          {item.q}
        </span>
        <ChevronDown
          className={[
            "w-4 h-4 text-[oklch(0.600_0.010_27.0)] shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-[14px] text-[oklch(0.450_0.010_27.0)] leading-relaxed">
          {item.a}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="bg-[oklch(0.977_0.005_27.0)] py-28 lg:py-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
          {/* Left */}
          <div ref={ref}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="text-[oklch(0.448_0.228_27.3)] text-[13px] font-semibold tracking-widest uppercase mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-[-0.025em] text-[oklch(0.112_0.012_27.0)] leading-[1.15]"
            >
              Common
              <br />
              questions.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="mt-5 text-[1.05rem] text-[oklch(0.450_0.010_27.0)] leading-relaxed"
            >
              Can't find what you're looking for?{" "}
              <a href="/contact" className="text-[oklch(0.448_0.228_27.3)] hover:underline">
                Contact us.
              </a>
            </motion.p>
          </div>

          {/* Right */}
          <div className="bg-white rounded-3xl p-8 border border-[oklch(0.920_0.006_27.0)]">
            {FAQS.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
