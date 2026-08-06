"use client";

import { type ReactNode } from "react";
import { RevealLine } from "@/components/motion/reveal-line";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Eyebrow({ children, className, delay = 0 }: Props) {
  return (
    <div className={`mb-5 flex items-center gap-3 ${className ?? ""}`}>
      <RevealLine delay={delay} />
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em]">
        {children}
      </span>
    </div>
  );
}
