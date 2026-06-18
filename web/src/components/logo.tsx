export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Swiss cross — bare, no container box */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="7" y="0" width="4" height="18" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
        <rect x="0" y="7" width="18" height="4" rx="1.5" fill="oklch(0.448 0.228 27.3)" />
      </svg>
      <span
        className="text-[15px] font-semibold tracking-[-0.025em]"
        style={{ color: dark ? "oklch(1 0 0)" : "oklch(0.112 0.012 27.0)" }}
      >
        AutoVerkauf
      </span>
    </span>
  );
}
