import { Nav } from "@/components/landing/nav";
import { ForDealers } from "@/components/landing/for-dealers";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "For dealerships — AutoVerkauf",
  description:
    "Receive direct requests from pre-qualified Swiss buyers who have already decided what they want and what they can spend.",
};

export default function ForDealersPage() {
  return (
    <main>
      <Nav />
      <ForDealers />
      <Footer />
    </main>
  );
}
