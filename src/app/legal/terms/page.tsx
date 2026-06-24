import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalContactBlock, LegalList, LegalSection } from "@/components/legal/LegalSections";
import { LEGAL_EMAIL, LEGAL_INTRO, LEGAL_JURISDICTION } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      currentSlug="terms"
      title="Terms of Service"
      description="Rules that govern access to and use of our platform by visitors, gym owners, and trainers."
    >
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{LEGAL_INTRO}</p>

      <LegalSection title="1. Agreement to these terms">
        <p>
          By accessing or using {SITE_NAME}, creating an account, or listing a gym, club, trainer
          profile, or event, you agree to these Terms of Service and our Privacy Policy. If you do
          not agree, do not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Who we are and what we provide">
        <p>
          {SITE_NAME} is an online discovery and listing platform. We help users find gyms, fighting
          clubs, trainers, and fitness events in Pakistan. We are <strong>not</strong> a gym
          operator, employer, booking agent, payment processor for memberships, or fitness/medical
          advisor. Contracts for training, membership, or events are between you and the listed
          business or individual.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility">
        <LegalList
          items={[
            "You must be at least 18 years old to register an owner or trainer account.",
            "You must provide accurate registration information and keep it up to date.",
            "You may use the public directory as a visitor without an account, subject to these terms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Accounts">
        <p>
          Gym owners and trainers must register and verify their email. You are responsible for
          safeguarding login credentials and for all activity under your account. Notify us
          immediately at {LEGAL_EMAIL} if you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="5. Listings and user content">
        <p>
          Owners and trainers are solely responsible for the accuracy, legality, and completeness of
          their listings, images, prices, timings, contact details, and event information. You
          represent that you have the right to publish all content you submit and that it does not
          infringe third-party rights.
        </p>
        <p>
          We may review, edit, reject, suspend, or remove listings that violate our policies or
          applicable law, but we are not obligated to monitor all content.
        </p>
      </LegalSection>

      <LegalSection title="6. WhatsApp and off-platform contact">
        <p>
          Our platform may link users to WhatsApp, phone, or external websites operated by listed
          businesses. We do not control those communications or transactions. Any agreement, payment,
          injury, dispute, or refund relating to a gym, trainer, or event is solely between the
          relevant parties.
        </p>
      </LegalSection>

      <LegalSection title="7. Featured listings and paid services">
        <p>
          If you purchase featured placement or other paid services, additional terms shown at
          checkout apply. Fees are non-refundable except where required by law or explicitly stated.
          We may change pricing or features with reasonable notice.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>
          You must comply with our{" "}
          <a href="/legal/acceptable-use" className="text-[#FF6A3D] hover:underline">
            Acceptable Use Policy
          </a>
          . Prohibited conduct includes fraud, impersonation, scraping that harms the service,
          malware, harassment, and posting unlawful or misleading content.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property">
        <p>
          The {SITE_NAME} name, logo, website design, and platform software are owned by us or our
          licensors. You receive a limited, non-exclusive licence to use the site for its intended
          purpose. You grant us a worldwide, royalty-free licence to host, display, and promote
          content you submit in connection with the service.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers">
        <p>
          The platform is provided &quot;as is&quot; and &quot;as available&quot;. See our{" "}
          <a href="/legal/disclaimer" className="text-[#FF6A3D] hover:underline">
            Disclaimer
          </a>{" "}
          for important limitations regarding listings, fitness activities, and third parties.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>
          To the fullest extent permitted by law in {LEGAL_JURISDICTION}, {SITE_NAME} and its
          operators shall not be liable for indirect, incidental, special, consequential, or
          punitive damages, or for loss of profits, data, goodwill, or business opportunities
          arising from your use of the platform or interactions with listed parties. Our total
          liability for any claim relating to the service shall not exceed the greater of (a) the
          amount you paid us in the twelve months before the claim, or (b) PKR 10,000.
        </p>
      </LegalSection>

      <LegalSection title="12. Indemnification">
        <p>
          You agree to indemnify and hold harmless {SITE_NAME} from claims, damages, and expenses
          (including reasonable legal fees) arising from your content, listings, breach of these
          terms, or your dealings with other users.
        </p>
      </LegalSection>

      <LegalSection title="13. Suspension and termination">
        <p>
          We may suspend or terminate accounts or access at any time for violations, legal
          requirements, or risk to users. You may stop using the service at any time. Provisions
          that by nature should survive termination will remain in effect.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes">
        <p>
          We may update these terms. Material changes will be posted on this page with an updated
          date. Continued use after changes constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="15. Governing law and disputes">
        <p>
          These terms are governed by the laws of the {LEGAL_JURISDICTION}. Courts in Pakistan
          shall have exclusive jurisdiction, subject to any mandatory consumer protections that
          apply to you. We encourage you to contact us first to resolve disputes informally.
        </p>
      </LegalSection>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
