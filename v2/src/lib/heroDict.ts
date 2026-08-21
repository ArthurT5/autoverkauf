import { useTranslations } from "@/lib/i18n/utils";
import type { Locale } from "@/lib/i18n/ui";
import type { HeroDict } from "@/components/Hero.tsx";

/** Resolve the hero string bundle for a locale. Shared by every hero variant. */
export function buildHeroDict(lang: Locale): HeroDict {
  const t = useTranslations(lang);
  return {
    kicker: t("hero.kicker"),
    line1: t("hero.h1.line1"),
    line2: t("hero.h1.line2"),
    sub: t("hero.sub"),
    ctaPrimary: t("hero.cta.primary"),
    ctaSecondary: t("hero.cta.secondary"),
    trustDealers: t("hero.trust.dealers"),
    trustFree: t("hero.trust.free"),
    trustTime: t("hero.trust.time"),
    chromeFile: t("hero.chrome.file"),
    chromeLive: t("hero.chrome.live"),
    rail: t("hero.rail"),
    scroll: t("hero.scroll"),
    cantons: t("hero.cantons"),
    requestLabel: t("panel.request.label"),
    reqModel: t("panel.request.model"),
    rows: [
      [t("panel.req.yearL"), t("panel.req.yearV")],
      [t("panel.req.kmL"), t("panel.req.kmV")],
      [t("panel.req.budgetL"), t("panel.req.budgetV")],
      [t("panel.req.regionL"), t("panel.req.regionV")],
    ],
    offersLabel: t("panel.offers.label"),
    responding: t("panel.offers.responding"),
    best: t("panel.offers.best"),
    match: t("panel.offers.match"),
  };
}
