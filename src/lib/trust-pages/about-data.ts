import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Award,
  BookOpen,
  Bot,
  Building2,
  CalendarDays,
  Dumbbell,
  Eye,
  Heart,
  Lightbulb,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const CORE_VALUES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Trust",
    description: "Verified listings and transparent information you can rely on.",
    icon: ShieldCheck,
  },
  {
    title: "Transparency",
    description: "Clear pricing, honest profiles, and open communication.",
    icon: Eye,
  },
  {
    title: "Community",
    description: "Building connections across Pakistan's fitness ecosystem.",
    icon: Users,
  },
  {
    title: "Innovation",
    description: "Modern tools that make fitness discovery effortless.",
    icon: Lightbulb,
  },
  {
    title: "Growth",
    description: "Helping people and businesses reach their full potential.",
    icon: TrendingUp,
  },
  {
    title: "Health",
    description: "Every feature designed to promote active, healthy living.",
    icon: Heart,
  },
];

export const DISCOVER_ITEMS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Gyms",
    description: "Browse fitness gyms across Pakistan.",
    href: "/gyms",
    icon: Dumbbell,
  },
  {
    title: "Personal Trainers",
    description: "Find certified coaches near you.",
    href: "/trainers",
    icon: Users,
  },
  {
    title: "Fighting Clubs",
    description: "Boxing, MMA, and martial arts clubs.",
    href: "/gyms/fighting-clubs",
    icon: Swords,
  },
  {
    title: "Events",
    description: "Competitions, workshops, and fitness events.",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Success Stories",
    description: "Real transformations from our community.",
    href: "/success-stories",
    icon: Trophy,
  },
  {
    title: "Fitness Blogs",
    description: "Tips, guides, and fitness insights.",
    href: "/blogs",
    icon: BookOpen,
  },
  {
    title: "Transformations",
    description: "Before-and-after journeys that inspire.",
    href: "/success-stories",
    icon: Activity,
  },
  {
    title: "Future AI Tools",
    description: "Smart search and personalized recommendations.",
    href: "/ai-gym-finder",
    icon: Bot,
  },
];

export const WHY_CHOOSE_FEATURES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Verified Listings",
    description: "Quality-checked gyms, trainers, and clubs.",
    icon: ShieldCheck,
  },
  {
    title: "Easy Search",
    description: "Filter by city, type, price, and more.",
    icon: Search,
  },
  {
    title: "Direct WhatsApp Contact",
    description: "Reach businesses instantly — no middleman.",
    icon: MessageCircle,
  },
  {
    title: "Compare Options",
    description: "Side-by-side profiles to find your fit.",
    icon: Target,
  },
  {
    title: "Location Based Search",
    description: "Discover fitness options in your area.",
    icon: MapPin,
  },
  {
    title: "Fitness Community",
    description: "Stories, events, and shared journeys.",
    icon: Users,
  },
  {
    title: "Success Stories",
    description: "Proof of real results from real people.",
    icon: Award,
  },
  {
    title: "Trainer Portfolios",
    description: "Detailed profiles with certifications.",
    icon: Sparkles,
  },
  {
    title: "Events",
    description: "Never miss a fight night or workshop.",
    icon: CalendarDays,
  },
  {
    title: "Reviews",
    description: "Community feedback on listings.",
    icon: Star,
  },
];

export const WHO_WE_HELP: {
  title: string;
  description: string;
  benefits: string[];
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Gym Owners",
    description: "Get discovered by thousands of fitness seekers across Pakistan.",
    benefits: [
      "Free gym listing with profile page",
      "WhatsApp lead generation",
      "Analytics dashboard",
      "Featured placement options",
    ],
    href: "/owner/register",
    icon: Building2,
  },
  {
    title: "Personal Trainers",
    description: "Showcase your expertise and connect with clients directly.",
    benefits: [
      "Professional trainer profile",
      "Portfolio and certifications",
      "Direct client contact",
      "Success story publishing",
    ],
    href: "/trainer/register",
    icon: Dumbbell,
  },
  {
    title: "Fighting Clubs",
    description: "Reach martial arts enthusiasts looking for the right club.",
    benefits: [
      "Specialized fighting club profiles",
      "Event promotion",
      "Community visibility",
      "Verified badge options",
    ],
    href: "/owner/register",
    icon: Swords,
  },
  {
    title: "Fitness Enthusiasts",
    description: "Find the perfect gym, trainer, or club for your goals.",
    benefits: [
      "Search and compare listings",
      "Read success stories",
      "Discover local events",
      "Contact directly on WhatsApp",
    ],
    href: "/gyms",
    icon: Zap,
  },
];

export const ROADMAP_ITEMS: {
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}[] = [
  {
    title: "Marketplace Launch",
    description: "Gym and fighting club discovery across Pakistan.",
    status: "completed",
  },
  {
    title: "Trainer Profiles",
    description: "Dedicated profiles for personal trainers and coaches.",
    status: "completed",
  },
  {
    title: "Success Stories",
    description: "Community transformation journeys and before/after galleries.",
    status: "completed",
  },
  {
    title: "Events",
    description: "Fight nights, workshops, and fitness events calendar.",
    status: "completed",
  },
  {
    title: "Blogs",
    description: "Fitness content hub with expert articles and guides.",
    status: "completed",
  },
  {
    title: "Fitness Community",
    description: "Member profiles, shared journeys, and social features.",
    status: "upcoming",
  },
  {
    title: "AI Features",
    description: "Smart gym search and personalized recommendations.",
    status: "upcoming",
  },
  {
    title: "Mobile Apps",
    description: "Native iOS and Android apps for on-the-go discovery.",
    status: "upcoming",
  },
  {
    title: "Future Milestones",
    description: "Booking, memberships, and nationwide fitness partnerships.",
    status: "upcoming",
  },
];

export const STORY_PARAGRAPHS = [
  "Finding the right gym, trainer or fighting club in Pakistan has always been difficult.",
  "People search on Facebook, ask friends, or rely on outdated information.",
  "Gym owners struggle to get discovered.",
  "Independent trainers have no platform to showcase their expertise.",
  "Fitness events often go unnoticed.",
  "FitnessAdda was built to solve these problems by creating one trusted platform where people can discover, compare and connect with Pakistan's fitness industry.",
];

export const MISSION_STATEMENT =
  "Our mission is to make fitness accessible by connecting every Pakistani with the right gym, trainer, fighting club and fitness opportunities.";

export const VISION_STATEMENT =
  "Our vision is to become Pakistan's largest digital fitness ecosystem.";
