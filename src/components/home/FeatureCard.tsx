import type { HomeFeature } from "@/lib/home-data";
import { CheckCircle2 } from "lucide-react";

interface FeatureCardProps {
  feature: HomeFeature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A3D]/10 text-[#FF6A3D]">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-heading mb-2 text-lg font-bold text-[var(--text)]">{feature.title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">{feature.description}</p>

      <ul className="space-y-2">
        {feature.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2 text-sm text-[var(--text)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A3D]" />
            {bullet}
          </li>
        ))}
      </ul>
    </article>
  );
}
