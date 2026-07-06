export interface HeroStats {
  gyms: number;
  trainers: number;
  clubs: number;
  users: number;
  cities: number;
}

export type HeroBackgroundSlide = {
  src: string;
  alt: string;
  /** CSS object-position value */
  position?: string;
};

export const HERO_BACKGROUND_SLIDES: HeroBackgroundSlide[] = [
  {
    src: "/images/Fighting_Person.png",
    alt: "FitnessAdda hero — martial arts and fighting training",
    position: "65% center",
  },
  {
    src: "/images/NewHeroSectionBGImage.png",
    alt: "FitnessAdda hero — premium gym and strength training",
    position: "65% center",
  },
  {
    src: "/images/Fitness_Trainer.png",
    alt: "FitnessAdda hero — personal fitness trainer",
    position: "center",
  },
  {
    src: "/images/FitnessAddaSlide.png",
    alt: "FitnessAdda hero — Fitness Adda gym at night",
    position: "right center",
  },
];

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
