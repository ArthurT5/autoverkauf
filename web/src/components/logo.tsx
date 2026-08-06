export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const line = dark ? "oklch(1 0 0)" : "oklch(0.112 0.012 27.0)";
  const red = "oklch(0.448 0.228 27.3)";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/*
        Convergence mark — three paths arriving at one node.
        Many dealers compete; their offers converge on a single buyer (the red
        node). The product idea, drawn.
      */}
      <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g stroke={line} strokeWidth="1.7" strokeLinecap="round">
          <path d="M1.6 4 L12 10" />
          <path d="M1.6 10 H12" />
          <path d="M1.6 16 L12 10" />
        </g>
        <circle cx="15.4" cy="10" r="3.6" fill={red} />
      </svg>
      <span
        className="text-[15px] font-semibold tracking-[-0.03em]"
        style={{ color: dark ? "oklch(1 0 0)" : "oklch(0.112 0.012 27.0)" }}
      >
        AutoVerkauf
      </span>
    </span>
  );
}
