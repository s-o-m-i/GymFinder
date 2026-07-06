export type NavLinkItem = {
  href: string;
  label: string;
  emoji?: string;
  description?: string;
};

export type NavSidebarSection = {
  title: string;
  items: NavLinkItem[];
};

/** Main discovery links — shown directly in the navbar on desktop */
export const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { href: "/gyms", label: "Gyms" },
  { href: "/trainers", label: "Trainers" },
  { href: "/gyms/fighting-clubs", label: "Fighting Clubs" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/events", label: "Events" },
];

/** Prominent business CTAs — visible in the navbar (replaces For Businesses dropdown) */
export const BUSINESS_CTA_LINKS: NavLinkItem[] = [
  { href: "/owner/register", label: "List Your Gym" },
  { href: "/trainer/register", label: "Join as Trainer" },
];

/** Secondary links — hamburger sidebar (desktop) + full menu (mobile) */
export const SIDEBAR_MENU_SECTIONS: NavSidebarSection[] = [
  {
    title: "Resources",
    items: [
      { href: "/about", label: "About" },
      { href: "/blogs", label: "Blog" },
      { href: "/blogs/category/fitness-tips", label: "Fitness Tips" },
      { href: "/blogs/category/nutrition", label: "Nutrition" },
      { href: "/blogs/category/workout", label: "Workout Guides" },
      { href: "/resources/faqs", label: "FAQs" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "For Businesses",
    items: [
      { href: "/owner/register?type=fighting-club", label: "List Fighting Club" },
      { href: "/for-businesses#why-join", label: "Why Join?" },
    ],
  },
  {
    title: "Tools",
    items: [{ href: "/ai-gym-finder", label: "AI Gym Search" }],
  },
];

export const AUTH_PATHS = {
  signIn: "/sign-in",
  shareStory: "/user/register",
  shareStoryDashboard: "/user/dashboard/success-stories",
} as const;

/** @deprecated Use PRIMARY_NAV_LINKS */
export const DISCOVER_LINKS = PRIMARY_NAV_LINKS;

/** @deprecated Use SIDEBAR_MENU_SECTIONS */
export const RESOURCES_LINKS = SIDEBAR_MENU_SECTIONS[0].items;

/** @deprecated Use BUSINESS_CTA_LINKS + SIDEBAR_MENU_SECTIONS */
export const FOR_BUSINESS_LINKS = [
  ...BUSINESS_CTA_LINKS,
  ...SIDEBAR_MENU_SECTIONS[1].items,
];

/** @deprecated Included in PRIMARY_NAV_LINKS */
export const TOP_LEVEL_NAV = {
  successStories: { href: "/success-stories", label: "Success Stories" },
  events: { href: "/events", label: "Events" },
} as const;
