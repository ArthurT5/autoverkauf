import { useEffect, useState } from "react";
import { animate } from "motion/react";
import { chf } from "@/lib/format";
import type { CantonCode } from "@/lib/cantons";

export const EASE = [0.16, 1, 0.3, 1] as const;

export interface Offer {
  id: string;
  dealer: string;
  canton: CantonCode;
  price: number;
  match: number;
}

// Illustrative product UI for one example request — not platform statistics.
export const OFFER_POOL: Offer[] = [
  { id: "a", dealer: "Garage Bellevue", canton: "ZH", price: 39800, match: 96 },
  { id: "b", dealer: "Auto Zugersee", canton: "ZG", price: 38900, match: 93 },
  { id: "c", dealer: "Garage Reuss", canton: "AG", price: 40500, match: 91 },
  { id: "d", dealer: "Carrosserie Aare", canton: "BE", price: 39200, match: 89 },
];

/** Dealers respond over time; offers arrive and re-rank by match. */
export function useLiveOffers(reduce: boolean) {
  const [visible, setVisible] = useState<Offer[]>(reduce ? OFFER_POOL : OFFER_POOL.slice(0, 2));
  useEffect(() => {
    if (reduce) return;
    const timers = [
      setTimeout(() => setVisible(OFFER_POOL.slice(0, 3)), 2400),
      setTimeout(() => setVisible(OFFER_POOL.slice(0, 4)), 4600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduce]);

  const sorted = [...visible].sort((a, b) => b.match - a.match);
  const bestMatch = Math.max(...sorted.map((o) => o.match));
  return { sorted, bestMatch, count: sorted.length };
}

export function AnimatedPrice({
  value,
  reduce,
  className = "",
}: {
  value: number;
  reduce: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(reduce ? value : Math.max(0, value - 1400));
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(Math.max(0, value - 1400), value, {
      duration: 0.95,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);
  return <span className={`num tabular-nums ${className}`}>{chf(Math.round(display))}</span>;
}
