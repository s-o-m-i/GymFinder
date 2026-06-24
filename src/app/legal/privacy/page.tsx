import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalContactBlock, LegalList, LegalSection } from "@/components/legal/LegalSections";
import { LEGAL_EMAIL, LEGAL_INTRO, LEGAL_JURISDICTION } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your personal data.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      currentSlug="privacy"
      title="Privacy Policy"
      description="How we collect, use, store, and share information when you use our platform."
    >
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{LEGAL_INTRO}</p>

      <LegalSection title="1. Scope">
        <p>
          This Privacy Policy applies to visitors, gym owners, trainers, and anyone who interacts
          with {SITE_NAME}. It describes personal data we process and your choices. By using the
          service, you acknowledge this policy.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong>Account and profile data:</strong> name, email, phone number, password (stored
          hashed), business or trainer profile details, photos, descriptions, pricing, locations,
          and event information you submit.
        </p>
        <p>
          <strong>Usage and analytics:</strong> pages viewed, search queries, clicks on listings,
          WhatsApp or phone redirect events, device/browser type, approximate location derived from
          IP, session identifiers, and timestamps.
        </p>
        <p>
          <strong>Communications:</strong> emails we send (verification codes, password reset,
          notifications) and messages you send to our support addresses.
        </p>
        <p>
          <strong>AI Gym Finder:</strong> if you use our AI search feature, your query and relevant
          context may be sent to our AI provider to generate results.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <LegalList
          items={[
            "Provide, maintain, and improve the directory and account features.",
            "Verify email addresses and secure accounts.",
            "Display public listings and search results.",
            "Measure interest in gyms, trainers, and events (analytics).",
            "Process featured listing requests and owner services.",
            "Respond to support requests and enforce our policies.",
            "Comply with legal obligations and protect against fraud or abuse.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Legal bases (where applicable)">
        <p>
          We process data based on performance of our service, legitimate interests (security,
          analytics, product improvement), consent (where required, e.g. marketing cookies), and
          legal obligations under applicable laws in {LEGAL_JURISDICTION}.
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing with third parties">
        <p>We may share data with service providers who help us operate the platform, including:</p>
        <LegalList
          items={[
            "Cloud hosting and database providers (e.g. Neon PostgreSQL).",
            "Email delivery (e.g. Resend) for verification and notifications.",
            "Image hosting (e.g. Cloudinary) for uploaded photos.",
            "AI providers (e.g. Google Gemini) for the AI Gym Finder feature.",
            "Analytics and infrastructure partners necessary to run the website.",
          ]}
        />
        <p>
          Public listing information (gym name, city, photos, etc.) is visible to all visitors.
          When you click WhatsApp or phone links, you leave our platform and the third party&apos;s
          privacy policy applies.
        </p>
        <p>
          We may disclose information if required by law, court order, or to protect rights, safety,
          and security of users and the public.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies and similar technologies">
        <p>
          We use cookies and local storage for sessions, authentication, and analytics. See our{" "}
          <a href="/legal/cookies" className="text-[#FF6A3D] hover:underline">
            Cookie Policy
          </a>{" "}
          for details.
        </p>
      </LegalSection>

      <LegalSection title="7. Data retention">
        <p>
          We retain account and listing data while your account is active and for a reasonable
          period afterward for backups, legal compliance, and dispute resolution. Analytics data may
          be aggregated or anonymized. You may request deletion subject to legal exceptions.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use industry-standard measures including HTTPS, hashed passwords, and access controls.
          No method of transmission or storage is 100% secure; you use the service at your own
          risk and should protect your credentials.
        </p>
      </LegalSection>

      <LegalSection title="9. Your rights">
        <p>
          Depending on applicable law, you may have rights to access, correct, delete, or restrict
          processing of your personal data, and to object to certain processing. To exercise these
          rights, email {LEGAL_EMAIL}. We will respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="10. Children">
        <p>
          Our service is not directed at children under 18. We do not knowingly collect personal
          data from children. If you believe a child has provided data, contact us for deletion.
        </p>
      </LegalSection>

      <LegalSection title="11. International transfers">
        <p>
          Your data may be processed on servers located outside Pakistan by our cloud providers.
          We take steps to ensure appropriate safeguards where required.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We may update this policy. The &quot;Last updated&quot; date at the top will change.
          Material updates may be communicated via email or a notice on the site.
        </p>
      </LegalSection>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
