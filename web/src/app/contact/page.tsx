import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/landing/nav";
import { Footer } from "@/components/landing/footer";
import { PageHero } from "@/components/page-hero";
import { Mail } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("contact");
  return { title: `${t("eyebrow")} — AutoVerkauf`, description: t("sub") };
}

type Topic = { heading: string; body: string; email: string };

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const topics = t.raw("topics") as Topic[];

  return (
    <main>
      <Nav />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} phase={3.6} />
      <div data-nav-theme="light" className="mx-auto max-w-2xl px-6 pb-28 pt-16">
        <div className="space-y-5">
          {topics.map((topic) => (
            <div
              key={topic.email}
              className="rounded-2xl border border-[var(--hairline)] bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-[15.5px] font-semibold text-[var(--ink-900)]">{topic.heading}</h2>
              <p className="mt-1 text-[13.5px] text-[var(--ink-500)]">{topic.body}</p>
              <a
                href={`mailto:${topic.email}`}
                className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-medium text-[oklch(0.448_0.228_27.3)] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {topic.email}
              </a>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
