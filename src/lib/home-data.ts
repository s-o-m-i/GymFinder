import type { LucideIcon } from "lucide-react";
import {
  Dumbbell,
  Target,
  Swords,
  Users,
  Search,
  BadgeCheck,
  Trophy,
  CalendarDays,
  Flower2,
} from "lucide-react";

export type HomeListingItem = {
  id: string;
  name: string;
  city: string;
  image: string | null;
  type: "gym" | "trainer";
  slug: string;
  rating?: number | null;
};

export type HomeEventPreview = {
  id: string;
  name: string;
  city: string;
  date: string;
  type: string;
  slug: string;
  featured?: boolean;
  image?: string | null;
};

export type HomeCategory = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "orange" | "navy";
};

export type ExploreCenterItem = {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  icon: LucideIcon;
};

export const EXPLORE_CENTER_ITEMS: ExploreCenterItem[] = [
  {
    title: "Gym",
    subtitle: "Immersed and refined",
    href: "/gyms",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=1200&fit=crop&q=80",
    icon: Dumbbell,
  },
  {
    title: "Boxing Club",
    subtitle: "Immersed and refined",
    href: "/gyms/boxing",
    image:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&h=1200&fit=crop&q=80",
    icon: Target,
  },
  {
    title: "Yoga Studio",
    subtitle: "Recognised and refined",
    href: "/gyms?search=yoga",
    image:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&h=1200&fit=crop&q=80",
    icon: Flower2,
  },
  {
    title: "Fitness Event",
    subtitle: "Immersed and refined",
    href: "/events",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&h=1200&fit=crop&q=80",
    icon: CalendarDays,
  },
  {
    title: "MMA Academy",
    subtitle: "Immersed and refined",
    href: "/gyms/mma",
    image:
      "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=900&h=1200&fit=crop&q=80",
    icon: Swords,
  },
  {
    title: "Fitness Trainers",
    subtitle: "Immersed and refined",
    href: "/trainers",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&h=1200&fit=crop&q=80",
    icon: Users,
  },
];

export type HomeFeature = {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
};

export type HomeSeoLink = {
  label: string;
  href: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    title: "Gyms",
    description: "Find verified fitness gyms with prices, timings, and ladies-only options across Pakistan.",
    href: "/gyms",
    icon: Dumbbell,
    accent: "orange",
  },
  {
    title: "Boxing Clubs",
    description: "Discover boxing gyms and fight clubs for beginners and competitive athletes.",
    href: "/gyms/boxing",
    icon: Target,
    accent: "orange",
  },
  {
    title: "MMA Academies",
    description: "Mixed martial arts training centers with cage, mat, and striking programs.",
    href: "/gyms/mma",
    icon: Swords,
    accent: "orange",
  },
  {
    title: "Fitness Trainers",
    description: "Browse certified personal trainers and coaches you can contact directly.",
    href: "/trainers",
    icon: Users,
    accent: "orange",
  },
];

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: "Gym Discovery",
    description: "Search gyms in Pakistan by city, budget, and facilities.",
    bullets: ["Verified gyms", "Prices, location, timings"],
    icon: Search,
  },
  {
    title: "Trainer Marketplace",
    description: "Fitness trainers in Pakistan for personal coaching and online plans.",
    bullets: ["Certified coaches", "Book or contact directly"],
    icon: BadgeCheck,
  },
  {
    title: "Fighting Clubs",
    description: "Boxing, MMA, and martial arts clubs listed in one directory.",
    bullets: ["Boxing, MMA, martial arts", "Fight-ready facilities"],
    icon: Trophy,
  },
  {
    title: "Fitness Events",
    description: "Competitions, seminars, and open mats near you.",
    bullets: ["Competitions & seminars", "Featured event listings"],
    icon: CalendarDays,
  },
];

export const HOME_MAP_CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi"] as const;

export const HOME_MAP_PINS = [
  { label: "Gym", top: "28%", left: "22%" },
  { label: "Boxing", top: "45%", left: "38%" },
  { label: "MMA", top: "35%", left: "58%" },
  { label: "Trainer", top: "55%", left: "72%" },
] as const;

export const HOME_SOCIAL_STATS = [
  { value: "500+", label: "Gyms Listed" },
  { value: "200+", label: "Trainers" },
  { value: "50+", label: "Cities Covered" },
] as const;

export const HOME_SEO_LINKS: HomeSeoLink[] = [
  { label: "Gyms in Lahore", href: "/gyms/lahore" },
  { label: "Gyms in Karachi", href: "/gyms?city=Karachi" },
  { label: "MMA Clubs in Pakistan", href: "/gyms/mma" },
  { label: "Boxing Gyms Islamabad", href: "/gyms/islamabad" },
  { label: "Fitness Trainers Pakistan", href: "/trainers" },
  { label: "Fighting Clubs Pakistan", href: "/gyms/fighting-clubs" },
  { label: "Gyms in Rawalpindi", href: "/gyms/rawalpindi" },
  { label: "Upcoming Fitness Events", href: "/events" },
];

export const MOCK_HOME_LISTINGS: HomeListingItem[] = [
  {
    id: "mock-gym-1",
    name: "Iron Pulse Fitness",
    city: "Lahore",
    image: null,
    type: "gym",
    slug: "iron-pulse-fitness",
    rating: 4.8,
  },
  {
    id: "mock-gym-2",
    name: "Champions Boxing Club",
    city: "Karachi",
    image: null,
    type: "gym",
    slug: "champions-boxing-club",
    rating: 4.6,
  },
  {
    id: "mock-trainer-1",
    name: "Ahmed Khan",
    city: "Islamabad",
    image: null,
    type: "trainer",
    slug: "ahmed-khan",
    rating: 4.9,
  },
  {
    id: "mock-trainer-2",
    name: "Sara Malik",
    city: "Rawalpindi",
    image: null,
    type: "trainer",
    slug: "sara-malik",
    rating: 4.7,
  },
];

export const MOCK_HOME_EVENTS: HomeEventPreview[] = [
  {
    id: "mock-event-1",
    name: "Islamabad Open Boxing Championship",
    city: "Islamabad",
    date: "Apr 12, 2026",
    type: "Boxing",
    slug: "islamabad-open-boxing",
    featured: true,
  },
  {
    id: "mock-event-2",
    name: "Lahore MMA Fight Night",
    city: "Lahore",
    date: "Apr 28, 2026",
    type: "MMA",
    slug: "lahore-mma-fight-night",
  },
  {
    id: "mock-event-3",
    name: "Karachi Fitness Expo",
    city: "Karachi",
    date: "May 5, 2026",
    type: "Fitness",
    slug: "karachi-fitness-expo",
  },
  {
    id: "mock-event-4",
    name: "Rawalpindi BJJ Seminar",
    city: "Rawalpindi",
    date: "May 18, 2026",
    type: "Martial Arts",
    slug: "rawalpindi-bjj-seminar",
    featured: true,
  },
];

export function listingProfileHref(item: HomeListingItem): string {
  return item.type === "gym" ? `/gyms/${item.slug}` : `/trainer/${item.slug}`;
}
