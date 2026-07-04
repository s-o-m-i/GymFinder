import { getAppBaseUrl } from "@/lib/resend";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export function buildAboutPageSchema() {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: SITE_NAME,
        url: baseUrl,
        description: SITE_DESCRIPTION,
        logo: `${baseUrl}/images/Logo.png`,
        areaServed: {
          "@type": "Country",
          name: "Pakistan",
        },
        sameAs: [
          "https://instagram.com/gymfinderpk",
          "https://facebook.com/gymfinderpk",
          "https://tiktok.com/@gymfinderpk",
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/about#webpage`,
        url: `${baseUrl}/about`,
        name: `About ${SITE_NAME}`,
        description:
          "Learn about FitnessAdda PK, Pakistan's largest fitness discovery platform connecting people with gyms, trainers, fighting clubs, and fitness events across the country.",
        isPartOf: { "@id": `${baseUrl}/#organization` },
        about: { "@id": `${baseUrl}/#organization` },
      },
    ],
  };
}

export function buildContactPageSchema() {
  const baseUrl = getAppBaseUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${baseUrl}/contact#webpage`,
        url: `${baseUrl}/contact`,
        name: `Contact ${SITE_NAME}`,
        description:
          "Get in touch with FitnessAdda PK for support, partnerships, business inquiries, or feedback.",
        isPartOf: { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: SITE_NAME,
        url: baseUrl,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "support@fitnessadda.pk",
            availableLanguage: ["English", "Urdu"],
            areaServed: "PK",
          },
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "business@fitnessadda.pk",
            availableLanguage: ["English", "Urdu"],
            areaServed: "PK",
          },
        ],
      },
    ],
  };
}
