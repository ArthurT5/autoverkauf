import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { PageHero } from "@/components/page-hero";

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: `${t("eyebrow")} — AutoVerkauf`, description: t("p1") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  return (
    <main>
      <Nav />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} phase={1.8} />
      <div data-nav-theme="light" className="mx-auto max-w-2xl px-6 pb-28 pt-16">
        <div className="prose-lg space-y-6 text-[var(--ink-500)] [&_strong]:text-[var(--ink-900)]">
          <p>{t("p1")}</p>
          <p>
            {t.rich("p2", {
              s: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
          <p>{t("p3")}</p>
          <p>{t("p4")}</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
