"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_PATHS } from "@/lib/nav-config";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";

interface ShareStoryNavButtonProps {
  isHero?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function ShareStoryNavButton({
  isHero = false,
  className,
  onNavigate,
}: ShareStoryNavButtonProps) {
  const [href, setHref] = useState<string>(AUTH_PATHS.shareStory);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean; role?: string }) => {
        if (data.authenticated && data.role === "user") {
          setHref(AUTH_PATHS.shareStoryDashboard);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href={href}
      data-magnetic={isHero ? "" : undefined}
      onClick={() => {
        trackGAEvent(GA_EVENTS.share_story, {
          action: "nav_click",
          destination: href,
        });
        onNavigate?.();
      }}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
        isHero
          ? "bg-[#FF6A3D] text-white hover:bg-[#e85528]"
          : "bg-[#FF6A3D] text-white hover:bg-[#e85528]",
        className
      )}
    >
      <Plus className="h-4 w-4 shrink-0" />
      Share Story
    </Link>
  );
}
