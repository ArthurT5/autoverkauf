import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { PageHero } from "@/components/page-hero";

export async function generateMetadata() {
  const t = await getTranslations("legal");
  return { title: `${t("privacyTitle")} — AutoVerkauf` };
}

type Section = { h: string; b: string };

export default async function PrivacyPage() {
  const t = await getTranslations("legal");
  const sections = t.raw("privacy") as Section[];

  return (
    <main>
      <Nav />
      <PageHero eyebrow={t("eyebrow")} title={t("privacyTitle")} sub={t("updated")} phase={5.1} />
      <div data-nav-theme="light" className="mx-auto max-w-2xl px-6 pb-28 pt-16">
        <div className="space-y-10">
          {sections.map((s) => (
            <div key={s.h}>
              <h2 className="text-[17px] font-semibold text-[var(--ink-900)]">{s.h}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-500)]">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
