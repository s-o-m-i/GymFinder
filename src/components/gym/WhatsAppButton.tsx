"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { analyticsRedirectUrl } from "@/lib/analytics-urls";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";
import { GymWhatsAppLeadModal } from "@/components/gym/GymWhatsAppLeadModal";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  gymId: string;
  gymName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
  /** Override label. Defaults to "WhatsApp" for sm/md, "Contact on WhatsApp" for lg */
  label?: string;
  /** Show lead capture modal before opening WhatsApp */
  captureLead?: boolean;
}

export function WhatsAppButton({
  gymId,
  gymName = "this gym",
  size = "md",
  className,
  fullWidth = false,
  label,
  captureLead = false,
}: WhatsAppButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const url = analyticsRedirectUrl(gymId, "WHATSAPP_CLICK");

  const defaultLabel = size === "lg" ? "Contact on WhatsApp" : "WhatsApp";
  const displayLabel = label ?? defaultLabel;

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5 rounded-xl",
    md: "h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-12 px-6 text-sm gap-2.5 rounded-xl font-bold",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 shrink-0",
    md: "w-4 h-4 shrink-0",
    lg: "w-5 h-5 shrink-0",
  };

  const buttonClass = cn(
    "inline-flex items-center justify-center",
    "font-semibold bg-[#25D366] text-white",
    "hover:bg-[#1da851] active:scale-[0.97]",
    "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
    sizes[size],
    fullWidth && "w-full",
    className
  );

  function trackWhatsAppClick() {
    trackGAEvent(GA_EVENTS.whatsapp_click, {
      entity_type: "gym",
      entity_id: gymId,
      entity_name: gymName,
      page_type: "profile",
    });
  }

  if (captureLead) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            trackWhatsAppClick();
            setModalOpen(true);
          }}
          className={buttonClass}
        >
          <MessageCircle className={iconSizes[size]} />
          <span>{displayLabel}</span>
        </button>
        <GymWhatsAppLeadModal
          gymId={gymId}
          gymName={gymName}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <a href={url} className={buttonClass} onClick={trackWhatsAppClick}>
      <MessageCircle className={iconSizes[size]} />
      <span>{displayLabel}</span>
    </a>
  );
}
