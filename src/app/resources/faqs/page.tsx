import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `FAQs | ${SITE_NAME}`,
};

const FAQS = [
  {
    q: "How do I list my gym or fighting club?",
    a: "Go to For Businesses → List Your Gym or List Fighting Club and complete registration.",
  },
  {
    q: "Can I share my own fitness transformation?",
    a: "Yes. Click Share Story in the navbar to create a free community account and publish your journey.",
  },
  {
    q: "Are success stories verified?",
    a: "Stories can be verified by our team before appearing on linked gym and trainer profiles.",
  },
  {
    q: "How do I find events near me?",
    a: "Browse the Events section to discover upcoming competitions, seminars, and gym events.",
  },
];

export default function ResourcesFaqsPage() {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-[var(--text)]">FAQs</h1>
          <div className="mt-8 space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="font-heading font-semibold text-[var(--text)]">{item.q}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.a}</p>
              </div>
            ))}
          </div>
          <Link href="/contact" className="mt-8 inline-flex font-semibold text-[#FF6A3D] hover:underline">
            Still need help? Contact us →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
