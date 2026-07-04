import Link from "next/link";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

export const metadata = {
  title: `Contact | ${SITE_NAME}`,
};

export default function ContactPage() {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold text-[var(--text)]">Contact</h1>
          <p className="mt-4 text-[var(--text-muted)] leading-relaxed">
            Questions about listings, success stories, or partnerships? Reach out through our social
            channels — we&apos;ll expand direct support options soon.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {Object.entries(SOCIAL_LINKS).map(([name, href]) => (
              <li key={name}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#FF6A3D] hover:underline capitalize">
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <Link href="/for-businesses" className="mt-8 inline-flex font-semibold text-[#0B2545] hover:underline">
            For businesses →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
