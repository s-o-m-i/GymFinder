import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "muted" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-[#0B2545] text-white",
  accent:
    "bg-[#FF6A3D] text-white",
  success:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  muted:
    "bg-[var(--border)] text-[var(--text-muted)]",
  outline:
    "border border-[var(--border)] text-[var(--text-muted)] bg-transparent",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
