import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { ForDealers } from "@/components/landing/for-dealers";
import { WhatHappensNext } from "@/components/landing/what-happens-next";
import { CantonMap } from "@/components/landing/canton-map";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <Stats />
      <ForDealers />
      <WhatHappensNext />
      <CantonMap />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
