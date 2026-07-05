"use client";

import { MessageCircle, Phone } from "lucide-react";
import { trainerAnalyticsRedirectUrl } from "@/lib/trainer-analytics-urls";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";
import { cn } from "@/lib/utils";

interface TrainerMobileStickyBarProps {
  trainerId: string;
  trainerName: string;
}

export function TrainerMobileStickyBar({ trainerId, trainerName }: TrainerMobileStickyBarProps) {
  const whatsappUrl = trainerAnalyticsRedirectUrl(trainerId, "WHATSAPP_CLICK");
  const phoneUrl = trainerAnalyticsRedirectUrl(trainerId, "PHONE_CLICK");

  const buttonClass =
    "inline-flex flex-1 min-w-0 items-center justify-center gap-2 h-10 px-4 text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] whitespace-nowrap";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label={`Contact ${trainerName}`}
    >
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackGAEvent(GA_EVENTS.whatsapp_click, {
              entity_type: "trainer",
              entity_id: trainerId,
              entity_name: trainerName,
              page_type: "profile",
              placement: "mobile_sticky",
            })
          }
          className={cn(buttonClass, "bg-[#25D366] text-white hover:bg-[#1da851]")}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          WhatsApp Trainer
        </a>
        <a
          href={phoneUrl}
          onClick={() =>
            trackGAEvent(GA_EVENTS.phone_click, {
              entity_type: "trainer",
              entity_id: trainerId,
              entity_name: trainerName,
              page_type: "profile",
              placement: "mobile_sticky",
            })
          }
          className={cn(buttonClass, "bg-[#0B2545] text-white hover:bg-[#071832]")}
        >
          <Phone className="h-4 w-4 shrink-0" />
          Call Trainer
        </a>
      </div>
    </div>
  );
}
