import type { LucideIcon } from "lucide-react";
import { Building2, CalendarDays, Dumbbell, Headphones, ShieldCheck, Star, UserRound, Users } from "lucide-react";
import type { HeroStats } from "@/lib/hero-data";

export type HomeCtaStat = {
  id: string;
  icon: LucideIcon;
  raw: number;
  display: string;
  label: string;
  suffix: string;
};

export type HomeCtaActionCard = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  linkLabel: string;
  href: string;
  icon: LucideIcon;
};

export const HOME_CTA_ACTION_CARDS: HomeCtaActionCard[] = [
  {
    id: "list-gym",
    eyebrow: "For Gyms & Studios",
    title: "List Your Gym",
    description:
      "Get discovered by thousands of fitness enthusiasts. Showcase your facilities, trainers, and membership plans.",
    linkLabel: "List Your Gym",
    href: "/owner/register",
    icon: Building2,
  },
  {
    id: "become-trainer",
    eyebrow: "For Trainers",
    title: "Become a Trainer",
    description:
      "Build your personal brand, connect with clients, and grow your coaching business across Pakistan.",
    linkLabel: "Join as Trainer",
    href: "/trainer/register",
    icon: UserRound,
  },
  {
    id: "promote-event",
    eyebrow: "For Event Organizers",
    title: "Promote Your Event",
    description:
      "Reach fighters, fitness fans, and gym-goers. List seminars, competitions, and fitness expos.",
    linkLabel: "Create an Event",
    href: "/for-businesses",
    icon: CalendarDays,
  },
  {
    id: "share-story",
    eyebrow: "For Everyone",
    title: "Share Your Story",
    description:
      "Inspire the community with your transformation journey. Your story could motivate thousands.",
    linkLabel: "Share Your Story",
    href: "/user/dashboard/success-stories/new",
    icon: Star,
  },
];

function formatStatPlus(value: number, floor: number): string {
  return `${Math.max(value, floor).toLocaleString("en-US")}+`;
}

function formatMemberStat(value: number, floor: number): string {
  const display = Math.max(value, floor);
  if (display >= 1_000_000) {
    return `${(display / 1_000_000).toFixed(1).replace(".0", "")}M+`;
  }
  if (display >= 1_000) {
    return `${Math.floor(display / 1_000)}K+`;
  }
  return `${display}+`;
}

export function buildHomeCtaStats(stats: HeroStats, eventsCount = 500): HomeCtaStat[] {
  return [
    {
      id: "gyms",
      icon: Dumbbell,
      raw: stats.gyms,
      display: formatStatPlus(stats.gyms, 1500),
      label: "Gyms Listed",
      suffix: "+",
    },
    {
      id: "trainers",
      icon: UserRound,
      raw: stats.trainers,
      display: formatStatPlus(stats.trainers, 3800),
      label: "Trainers",
      suffix: "+",
    },
    {
      id: "members",
      icon: Users,
      raw: stats.users,
      display: formatMemberStat(stats.users, 250_000),
      label: "Active Members",
      suffix: "+",
    },
    {
      id: "events",
      icon: CalendarDays,
      raw: eventsCount,
      display: formatStatPlus(eventsCount, 500),
      label: "Events Hosted",
      suffix: "+",
    },
  ];
}

export const HOME_CTA_TRUST_ITEMS = [
  {
    id: "trusted",
    icon: ShieldCheck,
    title: "Trusted Platform",
    description: "Verified listings. Real reviews. Genuine connections.",
  },
  {
    id: "support",
    icon: Headphones,
    title: "We're Here to Help",
    description: "Our team is always ready to support you.",
  },
] as const;

export const HOME_CTA_REVIEW_AVATARS = [
  { initials: "AK", className: "bg-[#FF6A3D]" },
  { initials: "SM", className: "bg-[#3b82f6]" },
  { initials: "HR", className: "bg-[#22c55e]" },
  { initials: "FN", className: "bg-[#a855f7]" },
] as const;
