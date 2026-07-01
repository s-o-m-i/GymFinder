import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogHeroProps {
  title?: string;
  description?: string;
  centered?: boolean;
}

export function BlogHero({
  title = "Fitness Blog",
  description = "Expert tips on training, nutrition, recovery, and building a stronger, healthier lifestyle.",
  centered = false,
}: BlogHeroProps) {
  return (
    <div className={cn("mb-8", centered && "text-center")}>
      <div className={cn("mb-2 flex items-center gap-2", centered && "justify-center")}>
        <Sparkles className="h-5 w-5 text-[#FF6A3D]" />
        <h1 className="font-heading text-2xl font-bold text-[var(--text)] sm:text-3xl">{title}</h1>
      </div>
      <p
        className={cn(
          "max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base",
          centered && "mx-auto"
        )}
      >
        {description}
      </p>
    </div>
  );
}
