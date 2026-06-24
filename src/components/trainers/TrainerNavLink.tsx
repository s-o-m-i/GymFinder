"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TrainerNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
  onNavigate?: () => void;
}

export function TrainerNavLink({ href, icon, label, exact = false, onNavigate }: TrainerNavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        isActive
          ? "bg-white/15 text-white"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
