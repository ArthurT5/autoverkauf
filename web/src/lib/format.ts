/** CHF with Swiss apostrophe grouping: 38500 → "CHF 38'500" */
export function chf(n: number): string {
  return "CHF " + new Intl.NumberFormat("de-CH").format(n);
}

/** short relative time: "2 h ago", "3 d ago"; falls back to a date */
export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("de-CH");
}

/** "sedan" | "suv" → "Sedan", "SUV"; joins lists with " / " */
export function labelList(items: string[] | null | undefined, fallback: string): string {
  if (!items || items.length === 0) return fallback;
  return items
    .map((i) => (i.length <= 4 ? i.toUpperCase() : i.charAt(0).toUpperCase() + i.slice(1)))
    .join(" / ");
}
