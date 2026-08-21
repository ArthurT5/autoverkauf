import { useTranslations } from "@/lib/i18n/utils";
import type { Locale } from "@/lib/i18n/ui";
import type { HowMaxDict } from "@/components/HowKinetic.tsx";

/** Resolve the maximal How-it-works string bundle for a locale. */
export function buildHowDict(lang: Locale): HowMaxDict {
  const t = useTranslations(lang);
  return {
    kicker: t("how.kicker"),
    acts: [
      { t: t("how.s1.t"), b: t("how.s1.b") },
      { t: t("how.s2.t"), b: t("how.s2.b") },
      { t: t("how.s3.t"), b: t("how.s3.b") },
    ],
    reqLabel: t("panel.request.label"),
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
    logs: [t("how.log1"), t("how.log2"), t("how.log3"), t("how.log4")],
  };
}
