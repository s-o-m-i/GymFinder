import {
  Dumbbell,
  Target,
  Swords,
  Zap,
  Flame,
  Shield,
  type LucideProps,
} from "lucide-react";

const TYPE_MAP: Record<string, React.ComponentType<LucideProps>> = {
  gym:          Dumbbell,
  boxing:       Target,
  mma:          Swords,
  muay_thai:    Zap,
  kickboxing:   Flame,
  martial_arts: Shield,
};

interface GymTypeIconProps extends LucideProps {
  type: string;
}

export function GymTypeIcon({ type, ...props }: GymTypeIconProps) {
  const Icon = TYPE_MAP[type] ?? Dumbbell;
  return <Icon {...props} />;
}

/** Returns the display label for a gym type */
export function gymTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    gym:          "Gym",
    boxing:       "Boxing",
    mma:          "MMA",
    muay_thai:    "Muay Thai",
    kickboxing:   "Kickboxing",
    martial_arts: "Martial Arts",
  };
  return labels[type] ?? type;
}
