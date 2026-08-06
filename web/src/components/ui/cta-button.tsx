"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost-dark";

const VARIANTS: Record<Variant, string> = {
  // red, glows + lifts on hover, compresses on press
  primary:
    "bg-[var(--red)] text-white shadow-[var(--shadow-red)] hover:bg-[oklch(0.470_0.225_27.3)] hover:shadow-[0_10px_32px_-6px_oklch(0.448_0.228_27.3/0.6)]",
  // quiet outline on light surfaces
  secondary:
    "border border-[var(--hairline)] bg-white text-[var(--ink-700)] hover:border-[var(--ink-400)] hover:shadow-[var(--shadow-card)]",
  // outline on dark surfaces
  "ghost-dark":
    "border border-white/15 text-white hover:bg-white/[0.06] hover:border-white/25",
};

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  type?: "button" | "submit";
  "aria-label"?: string;
};

export function CtaButton({
  children,
  href,
  onClick,
  variant = "primary",
  arrow = false,
  className = "",
  type = "button",
  ...rest
}: Props) {
  const classes = [
    "btn-lift group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4",
    "text-[14px] font-semibold whitespace-nowrap select-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--red)]/25",
    VARIANTS[variant],
    className,
  ].join(" ");

  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {inner}
    </button>
  );
}
