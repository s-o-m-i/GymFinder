export type NavLinkItem = {
  href: string;
  label: string;
  emoji?: string;
  description?: string;
};

export const DISCOVER_LINKS: NavLinkItem[] = [
  { href: "/gyms", label: "Gyms", emoji: "🏋", description: "Find gyms near you" },
  {
    href: "/gyms/fighting-clubs",
    label: "Fighting Clubs",
    emoji: "🥊",
    description: "Boxing, MMA & martial arts",
  },
  { href: "/trainers", label: "Trainers", emoji: "👨‍🏫", description: "Certified coaches" },
  {
    href: "/ai-gym-finder",
    label: "AI Gym Search",
    emoji: "✨",
    description: "Smart gym recommendations",
  },
];

export const RESOURCES_LINKS: NavLinkItem[] = [
  { href: "/about", label: "About", description: "Our mission" },
  { href: "/blogs", label: "Blog", description: "Latest articles & news" },
  { href: "/blogs/category/fitness-tips", label: "Fitness Tips", description: "Training advice" },
  { href: "/blogs/category/nutrition", label: "Nutrition", description: "Diet & meal guidance" },
  { href: "/blogs/category/workout", label: "Workout Guides", description: "Programmes & routines" },
  { href: "/resources/faqs", label: "FAQs", description: "Common questions" },
  { href: "/contact", label: "Contact", description: "Get in touch" },
];

export const FOR_BUSINESS_LINKS: NavLinkItem[] = [
  { href: "/owner/register", label: "List Your Gym", description: "Reach new members" },
  { href: "/trainer/register", label: "Register Trainer", description: "Build your client base" },
  {
    href: "/owner/register?type=fighting-club",
    label: "List Fighting Club",
    description: "Showcase your club",
  },
  { href: "/for-businesses#pricing", label: "Pricing", description: "Plans & promotion" },
  { href: "/for-businesses#why-join", label: "Why Join?", description: "Grow with FitnessAdda" },
];

export const TOP_LEVEL_NAV = {
  successStories: { href: "/success-stories", label: "Success Stories" },
  events: { href: "/events", label: "Events" },
} as const;

export const AUTH_PATHS = {
  signIn: "/sign-in",
  shareStory: "/user/register",
  shareStoryDashboard: "/user/dashboard/success-stories",
} as const;
