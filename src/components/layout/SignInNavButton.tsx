"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AUTH_PATHS } from "@/lib/nav-config";

interface SignInNavButtonProps {
  isHero?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function SignInNavButton({ isHero = false, className, onNavigate }: SignInNavButtonProps) {
  const [href, setHref] = useState<string>(AUTH_PATHS.signIn);
  const [label, setLabel] = useState("Sign In");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean; redirect?: string; label?: string }) => {
        if (data.authenticated && data.redirect) {
          setHref(data.redirect);
          setLabel(data.label ?? "Dashboard");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors xl:px-4",
        isHero
          ? "border border-white/30 text-white hover:bg-white/10"
          : "border border-[var(--border)] text-[var(--text)] hover:border-[#0B2545]/30 hover:bg-[var(--bg)]",
        className
      )}
    >
      {label}
    </Link>
  );
}
