export interface HeroStats {
  gyms: number;
  trainers: number;
  clubs: number;
  users: number;
  cities: number;
}

export interface DisciplineCardData {
  type: string;
  title: string;
  description: string;
  listings: number;
  glow: "orange" | "blue";
}

export const HERO_DISCIPLINES: Omit<DisciplineCardData, "listings">[] = [
  {
    type: "boxing",
    title: "Boxing",
    description: "From beginner-friendly clubs to competitive fight gyms.",
    glow: "orange",
  },
  {
    type: "mma",
    title: "MMA",
    description: "Mixed martial arts academies with cage and mat training.",
    glow: "orange",
  },
  {
    type: "gym",
    title: "Fitness Gym",
    description: "Weight training, cardio, and general fitness facilities.",
    glow: "blue",
  },
  {
    type: "martial_arts",
    title: "Martial Arts",
    description: "Karate, BJJ, taekwondo, and traditional disciplines.",
    glow: "blue",
  },
];

export function formatHeroStatCount(n: number): string {
  if (n >= 1000) return `${n.toLocaleString("en-US")}+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  if (n >= 10) return `${n}+`;
  return String(n);
}
