import { Venus, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  ladies_only: {
    label: "Ladies Only",
    icon: Venus,
    className: "bg-pink-50 text-pink-700 border-pink-200",
  },
  ladies_timings: {
    label: "Ladies-Only Hours",
    icon: Venus,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  mixed: {
    label: "Mixed",
    icon: Users,
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  men_only: {
    label: "Men Only",
    icon: User,
    className: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

interface LadiesStatusBadgeProps {
  status: string;
  className?: string;
}

export function LadiesStatusBadge({ status, className }: LadiesStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {config.label}
    </span>
  );
}

export function ladiesStatusLabel(status: string): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
