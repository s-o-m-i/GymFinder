import type { Metadata } from "next";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AiGymFinderClient } from "@/components/ai/AiGymFinderClient";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "AI Gym Finder",
  description:
    "Search gyms and fighting clubs in Pakistan using natural language. Find boxing, MMA, ladies-only, and affordable gyms powered by AI filter extraction.",
  openGraph: {
    title: `AI Gym Finder | ${SITE_NAME}`,
    description:
      "Describe the gym you want in plain English — our AI finds real listings from our database.",
    type: "website",
  },
};

export default function AiGymFinderPage() {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <AiGymFinderClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
