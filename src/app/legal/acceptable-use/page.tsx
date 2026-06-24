import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalContactBlock, LegalList, LegalSection } from "@/components/legal/LegalSections";
import { LEGAL_INTRO } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: `Rules for acceptable behaviour and content on ${SITE_NAME}.`,
};

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      currentSlug="acceptable-use"
      title="Acceptable Use Policy"
      description="Standards of conduct and content for everyone who uses our platform."
    >
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{LEGAL_INTRO}</p>

      <LegalSection title="1. Purpose">
        <p>
          This policy sets rules to keep {SITE_NAME} safe, trustworthy, and useful for the fitness
          community in Pakistan. It applies to all visitors, gym owners, trainers, and event
          organisers.
        </p>
      </LegalSection>

      <LegalSection title="2. Accurate listings">
        <LegalList
          items={[
            "Provide truthful information about your business, qualifications, prices, and facilities.",
            "Do not impersonate another gym, trainer, or brand.",
            "Do not list fake addresses, duplicate spam listings, or misleading photos.",
            "Keep ladies-only, timing, and pricing information current.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Prohibited content">
        <LegalList
          items={[
            "Illegal activities, hate speech, harassment, or discrimination.",
            "Sexually explicit content unrelated to legitimate fitness services.",
            "Dangerous or unqualified training claims (e.g. guaranteed weight loss, medical cures).",
            "Malware, phishing, or attempts to steal credentials or data.",
            "Copyright or trademark infringement without permission.",
            "Scams, pyramid schemes, or fraudulent membership offers.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Prohibited behaviour">
        <LegalList
          items={[
            "Automated scraping or bulk harvesting of listings beyond normal browsing.",
            "Circumventing security, rate limits, or access controls.",
            "Creating multiple accounts to manipulate ratings or featured placement.",
            "Contacting users for unsolicited marketing unrelated to fitness services.",
            "Abusing WhatsApp or contact features to spam or threaten others.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Events">
        <p>
          Event organisers must ensure events comply with local laws, venue rules, and safety
          requirements. You must not list events you are not authorised to promote. Cancel or update
          listings promptly if details change.
        </p>
      </LegalSection>

      <LegalSection title="6. Enforcement">
        <p>
          We may warn, restrict, suspend, or permanently remove accounts and listings that violate
          this policy or our Terms of Service. Serious violations may be reported to authorities.
          We are not obliged to monitor all activity but may act on reports and automated signals.
        </p>
      </LegalSection>

      <LegalSection title="7. Reporting">
        <p>
          To report abuse, email us with the listing URL, description of the issue, and supporting
          evidence. We review reports in good faith and take action we deem appropriate.
        </p>
      </LegalSection>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
