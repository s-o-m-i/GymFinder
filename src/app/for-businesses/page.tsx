import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `For Businesses | ${SITE_NAME}`,
  description: "List your gym, fighting club, or trainer profile on FitnessAdda PK.",
};

export default function ForBusinessesPage() {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">For businesses</p>
          <h1 className="font-heading mt-2 text-3xl font-bold text-[var(--text)] sm:text-4xl">
            Grow with Pakistan&apos;s fitness marketplace
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--text-muted)] leading-relaxed">
            Reach members searching for gyms, fighting clubs, and trainers. Publish events, success
            stories, and a profile that converts on WhatsApp.
          </p>

          <section id="why-join" className="mt-12 scroll-mt-24">
            <h2 className="font-heading text-xl font-bold text-[var(--text)]">Why join?</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Be discovered by city, sport, and goal",
                "Showcase transformations & success stories",
                "Promote events to local athletes",
                "Direct WhatsApp & call leads",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text-muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="pricing" className="mt-12 scroll-mt-24">
            <h2 className="font-heading text-xl font-bold text-[var(--text)]">Pricing</h2>
            <div className="mt-4 rounded-2xl border border-[#FF6A3D]/25 bg-[#FF6A3D]/5 px-5 py-4">
              <p className="text-sm font-semibold text-[#FF6A3D]">Currently free for all businesses</p>
              <p className="mt-2 text-[var(--text-muted)] leading-relaxed">
                At this stage, listing your gym, fighting club, or trainer profile on {SITE_NAME} is
                completely free — including standard listings, profile pages, and core discovery
                features across our marketplace.
              </p>
            </div>
            <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
              As the platform grows, we may introduce optional paid plans for advanced tools such
              as featured placement, enhanced visibility, and premium business features. Any future
              pricing will be communicated clearly in advance, and essential listing access will
              remain accessible to Pakistan&apos;s fitness community.
            </p>
            <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
              Create your account today at no cost and start reaching members searching in your city.
            </p>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/owner/register"
              className="inline-flex rounded-xl bg-[#FF6A3D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85528]"
            >
              List your gym
            </Link>
            <Link
              href="/trainer/register"
              className="inline-flex rounded-xl border border-[#0B2545] px-5 py-2.5 text-sm font-semibold text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
            >
              Register as trainer
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--bg)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
