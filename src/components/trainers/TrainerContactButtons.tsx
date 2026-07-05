"use client";

import { MessageCircle, Phone } from "lucide-react";
import { trainerAnalyticsRedirectUrl } from "@/lib/trainer-analytics-urls";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";
import { cn } from "@/lib/utils";

interface TrainerContactButtonsProps {
  trainerId: string;
  trainerName: string;
  whatsappNumber: string;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  layout?: "default" | "compact";
  className?: string;
}

export function TrainerContactButtons({
  trainerId,
  trainerName,
  whatsappNumber: _whatsappNumber,
  email,
  size = "md",
  layout = "default",
  className,
}: TrainerContactButtonsProps) {
  const whatsappUrl = trainerAnalyticsRedirectUrl(trainerId, "WHATSAPP_CLICK");
  const phoneHref = trainerAnalyticsRedirectUrl(trainerId, "PHONE_CLICK");
  const emailHref = email
    ? trainerAnalyticsRedirectUrl(trainerId, "CONTACT_CLICK")
    : null;

  function trackWhatsAppClick() {
    trackGAEvent(GA_EVENTS.whatsapp_click, {
      entity_type: "trainer",
      entity_id: trainerId,
      entity_name: trainerName,
      page_type: "profile",
    });
  }

  function trackPhoneClick() {
    trackGAEvent(GA_EVENTS.phone_click, {
      entity_type: "trainer",
      entity_id: trainerId,
      entity_name: trainerName,
      page_type: "profile",
    });
  }

  const sizes = {
    sm: "h-9 min-h-9 px-3 text-xs gap-1.5 rounded-xl",
    md: "h-10 min-h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-11 min-h-11 px-4 text-sm gap-2 rounded-xl font-semibold",
  };

  const sizeClass = sizes[size];

  const primaryRowClass =
    layout === "compact"
      ? "flex flex-row gap-2"
      : "flex flex-col sm:flex-row gap-2";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className={primaryRowClass}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackWhatsAppClick}
          className={cn(
            "inline-flex flex-1 min-w-0 items-center justify-center font-semibold transition-all active:scale-[0.98]",
            "bg-[#25D366] text-white hover:bg-[#1da851]",
            sizeClass
          )}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
        <a
          href={phoneHref}
          onClick={trackPhoneClick}
          className={cn(
            "inline-flex flex-1 min-w-0 items-center justify-center font-semibold transition-all active:scale-[0.98]",
            "bg-[#0B2545] text-white hover:bg-[#071832]",
            sizeClass
          )}
        >
          <Phone className="h-4 w-4 shrink-0" />
          Call
        </a>
      </div>
      {email && emailHref && (
        <a
          href={emailHref}
          className={cn(
            "flex w-full items-center justify-center font-semibold transition-all active:scale-[0.98]",
            "bg-[var(--bg)] text-[#0B2545] border border-[var(--border)] hover:border-[#0B2545]",
            sizeClass
          )}
        >
          Email
        </a>
      )}
    </div>
  );
}
