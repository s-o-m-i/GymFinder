import type { LucideIcon } from "lucide-react";
import { Building2, CalendarDays, Trophy, UserRound, Users } from "lucide-react";

export type EcosystemNodeId = "users" | "trainer" | "gym" | "success-story" | "events";

export type EcosystemNode = {
  id: EcosystemNodeId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Vertical position in the network SVG viewBox (0–600) */
  y: number;
};

export const ECOSYSTEM_NETWORK_VIEWBOX = {
  width: 420,
  height: 600,
  centerX: 210,
} as const;

export const ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: "users",
    label: "Users",
    description: "Discover gyms, trainers, and events nationwide",
    icon: Users,
    y: 52,
  },
  {
    id: "trainer",
    label: "Trainer",
    description: "Coaches connect with clients and gyms",
    icon: UserRound,
    y: 172,
  },
  {
    id: "gym",
    label: "Gym",
    description: "Verified listings reach the right audience",
    icon: Building2,
    y: 292,
  },
  {
    id: "success-story",
    label: "Success Story",
    description: "Real transformations inspire the community",
    icon: Trophy,
    y: 412,
  },
  {
    id: "events",
    label: "Events",
    description: "Fight nights, seminars, and fitness expos",
    icon: CalendarDays,
    y: 532,
  },
];

/** Neural-style connection paths between ecosystem nodes */
export const ECOSYSTEM_NETWORK_PATHS = [
  "M 210 78 L 210 146",
  "M 210 198 L 210 266",
  "M 210 318 L 210 386",
  "M 210 438 L 210 506",
  "M 210 52 C 88 88, 72 148, 210 172",
  "M 210 52 C 332 88, 348 148, 210 172",
  "M 210 172 C 64 228, 48 292, 210 292",
  "M 210 172 C 356 228, 372 292, 210 292",
  "M 88 172 Q 140 248, 210 292",
  "M 332 172 Q 280 248, 210 292",
  "M 210 292 C 72 348, 56 412, 210 412",
  "M 210 292 C 348 348, 364 412, 210 412",
  "M 120 292 Q 168 368, 210 412",
  "M 300 292 Q 252 368, 210 412",
  "M 210 412 C 96 468, 80 532, 210 532",
  "M 210 412 C 324 468, 340 532, 210 532",
  "M 88 412 Q 150 478, 210 532",
  "M 332 412 Q 270 478, 210 532",
] as const;
