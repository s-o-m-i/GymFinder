import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LegalContactBlock, LegalList, LegalSection } from "@/components/legal/LegalSections";
import { LEGAL_INTRO } from "@/lib/legal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `Important disclaimers for ${SITE_NAME} users and listing partners.`,
};

export default function DisclaimerPage() {
  return (
    <LegalPageLayout
      currentSlug="disclaimer"
      title="Disclaimer"
      description="Important limitations regarding listings, fitness activities, and third-party services."
    >
      <p className="mb-8 text-sm leading-relaxed text-[var(--text-muted)]">{LEGAL_INTRO}</p>

      <LegalSection title="1. Platform role">
        <p>
          {SITE_NAME} is a directory and discovery platform. We do not own, operate, supervise, or
          control listed gyms, fighting clubs, trainers, or event organisers. Appearance on our site
          does not constitute an endorsement, partnership, or guarantee of quality, safety, or
          legality.
        </p>
      </LegalSection>

      <LegalSection title="2. Not medical or professional advice">
        <p>
          Content on {SITE_NAME} — including AI-generated search results, descriptions, ratings, and
          articles — is for general information only. It is <strong>not</strong> medical advice,
          nutritional advice, or personalised fitness instruction. Consult a qualified healthcare
          or fitness professional before starting any exercise programme, especially if you have
          health conditions, injuries, or are pregnant.
        </p>
      </LegalSection>

      <LegalSection title="3. Physical activity and injury risk">
        <p>
          Martial arts, boxing, weight training, and other fitness activities carry inherent risks
          of injury or death. You participate at your own risk. {SITE_NAME} is not responsible for
          injuries, losses, or damages arising from training, events, equipment, facilities, or
          coaching provided by third parties.
        </p>
      </LegalSection>

      <LegalSection title="4. Listing accuracy">
        <p>
          Prices, timings, facilities, ladies-only policies, certifications, and other listing
          details are supplied by gym owners and trainers. Information may become outdated or
          incomplete. Always confirm directly with the business before visiting, joining, or
          paying.
        </p>
      </LegalSection>

      <LegalSection title="5. Ratings and reviews">
        <p>
          Ratings displayed on the platform may be submitted by users or provided by listing owners.
          They reflect opinions at a point in time and may not represent current conditions. We do
          not guarantee the accuracy of ratings.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-party links and WhatsApp">
        <p>
          Links to WhatsApp, phone numbers, social media, or external websites are provided for
          convenience. We are not responsible for the content, privacy practices, or conduct of
          third parties. Communications and payments made off-platform are solely between you and
          the other party.
        </p>
      </LegalSection>

      <LegalSection title="7. Featured and paid placement">
        <p>
          Featured or promoted listings receive enhanced visibility. Paid placement does not mean
          we have verified safety, licensing, or quality beyond our standard listing policies.
        </p>
      </LegalSection>

      <LegalSection title="8. No warranties">
        <p>
          The website and services are provided without warranties of any kind, whether express or
          implied, including merchantability, fitness for a particular purpose, and non-infringement,
          to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the maximum extent permitted by applicable law, {SITE_NAME} shall not be liable for any
          direct or indirect damages arising from reliance on platform content or interactions with
          listed parties. See our{" "}
          <a href="/legal/terms" className="text-[#FF6A3D] hover:underline">
            Terms of Service
          </a>{" "}
          for further limitations.
        </p>
      </LegalSection>

      <LegalSection title="10. Report concerns">
        <LegalList
          items={[
            "Report misleading, unsafe, or unlawful listings to us promptly.",
            "For emergencies or criminal activity, contact local authorities.",
            "We may remove listings that violate our policies but cannot guarantee immediate action.",
          ]}
        />
      </LegalSection>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
