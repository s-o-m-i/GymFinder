"use client";

import { MessageCircle } from "lucide-react";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";

interface EventRegisterButtonProps {
  href: string;
  eventId: string;
  eventTitle: string;
}

export function EventRegisterButton({ href, eventId, eventTitle }: EventRegisterButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackGAEvent(GA_EVENTS.event_registered, {
          event_id: eventId,
          event_title: eventTitle,
          method: "whatsapp",
        })
      }
      className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#1da851] transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      Contact on WhatsApp
    </a>
  );
}
