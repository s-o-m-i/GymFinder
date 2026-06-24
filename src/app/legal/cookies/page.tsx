import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalContactBlock, LegalList, LegalSection } from "@/components/legal/LegalSections";
import { LEGAL_INTRO } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${SITE_NAME} uses cookies and similar technologies.`,
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      currentSlug="cookies"
      title="Cookie Policy"
      description="Information about cookies and similar technologies used on our website."
    >
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{LEGAL_INTRO}</p>

      <LegalSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website. They help the
          site remember your session, preferences, and usage patterns. We also use similar
          technologies such as local storage and session identifiers.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies we use">
        <p>
          <strong>Strictly necessary:</strong> required for the site to function, including
          authentication cookies for gym owner, trainer, and admin sessions, and security-related
          tokens.
        </p>
        <p>
          <strong>Analytics:</strong> we use a first-party session cookie (e.g.{" "}
          <code className="rounded bg-[var(--bg)] px-1.5 py-0.5 text-xs">gymxclubs_session</code>)
          to understand how visitors browse listings and which contact buttons are used. This helps
          us improve search and listings.
        </p>
        <p>
          We do not currently use third-party advertising cookies on {SITE_NAME}.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookie details">
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--card)]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[var(--text)]">Name</th>
                <th className="px-4 py-3 font-semibold text-[var(--text)]">Purpose</th>
                <th className="px-4 py-3 font-semibold text-[var(--text)]">Duration</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-muted)]">
              <tr className="border-b border-[var(--border)]">
                <td className="px-4 py-3 font-mono text-xs">owner_session</td>
                <td className="px-4 py-3">Gym owner login session</td>
                <td className="px-4 py-3">Up to 7 days</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="px-4 py-3 font-mono text-xs">trainer_session</td>
                <td className="px-4 py-3">Trainer login session</td>
                <td className="px-4 py-3">Up to 7 days</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="px-4 py-3 font-mono text-xs">admin_session</td>
                <td className="px-4 py-3">Admin login session</td>
                <td className="px-4 py-3">Up to 8 hours</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs">gymxclubs_session</td>
                <td className="px-4 py-3">Anonymous analytics session</td>
                <td className="px-4 py-3">Up to 1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection title="4. Managing cookies">
        <LegalList
          items={[
            "You can block or delete cookies in your browser settings.",
            "Blocking strictly necessary cookies may prevent login and core features.",
            "To sign out, use the logout option in your account panel, which clears session cookies.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Updates">
        <p>
          We may update this Cookie Policy when we add new features or cookies. Check this page for
          the latest information.
        </p>
      </LegalSection>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
