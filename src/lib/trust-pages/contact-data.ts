import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Briefcase,
  Headphones,
  Megaphone,
} from "lucide-react";
import type { ContactSubject } from "@/lib/validations/contact-form";

export const CONTACT_EMAILS = {
  support: "skullhunter030@gmail.com",
  business: "sulemandevofficial@gmail.com",
} as const;

export const CONTACT_WHATSAPP = "+92 3199828336";

export const CONTACT_HOURS = "Monday–Saturday, 10AM–7PM (PKT)";

export const QUICK_CONTACT_CARDS: {
  title: string;
  description: string;
  subject: ContactSubject;
  icon: LucideIcon;
}[] = [
  {
    title: "Business Partnerships",
    description: "Explore sponsorships, integrations, and brand collaborations.",
    subject: "partnership",
    icon: Briefcase,
  },
  {
    title: "Need Help",
    description: "Account issues, listing questions, or general support.",
    subject: "support",
    icon: Headphones,
  },
  {
    title: "Report an Issue",
    description: "Flag incorrect listings or policy concerns.",
    subject: "report",
    icon: AlertTriangle,
  },
  {
    title: "Media Inquiries",
    description: "Press, interviews, and partnership announcements.",
    subject: "general",
    icon: Megaphone,
  },
];

export const CONTACT_FAQS: { id: string; question: string; answer: string }[] = [
  {
    id: "list-gym",
    question: "How do I list my gym?",
    answer:
      "Create a free owner account at fitnessadda.pk/owner/register, complete your gym profile with photos, pricing, and amenities, then submit for review. Our team verifies listings before they go live.",
  },
  {
    id: "become-trainer",
    question: "How do I become a trainer?",
    answer:
      "Register at fitnessadda.pk/trainer/register, build your trainer profile with certifications and specializations, and publish when ready. Clients can discover you and contact you directly via WhatsApp.",
  },
  {
    id: "update-profile",
    question: "How do I update my profile?",
    answer:
      "Sign in to your owner or trainer dashboard, navigate to Profile or Gym settings, make your changes, and save. Updates appear on your public listing after review if required.",
  },
  {
    id: "report-info",
    question: "How can I report incorrect information?",
    answer:
      "Use the contact form and select \"Report Listing\" as the subject. Include the listing URL and details about the issue. We investigate and update listings promptly.",
  },
  {
    id: "is-free",
    question: "Is FitnessAdda free?",
    answer:
      "Browsing gyms, trainers, events, and success stories is free for everyone. Gym and trainer listings have free tiers; optional featured placement and premium tools are available for businesses.",
  },
  {
    id: "success-stories",
    question: "How do Success Stories work?",
    answer:
      "Gyms, trainers, and community members can publish verified transformation journeys with before/after photos. Browse stories at fitnessadda.pk/success-stories or share your own from your dashboard.",
  },
];

export const SOCIAL_PLATFORMS = [
  {
    name: "Instagram",
    href: "https://instagram.com/gymfinderpk",
    color: "from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/gymfinderpk",
    color: "from-[#1877F2] to-[#0d5dbf]",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/fitnessadda",
    color: "from-[#0A66C2] to-[#004182]",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@fitnessadda",
    color: "from-[#FF0000] to-[#cc0000]",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@gymfinderpk",
    color: "from-[#010101] to-[#25F4EE]",
  },
] as const;
