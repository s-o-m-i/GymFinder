"use client";

import { MessageCircle, Phone } from "lucide-react";
import { buildTrainerWhatsAppUrl } from "@/lib/trainer-constants";
import { cn } from "@/lib/utils";

interface TrainerContactButtonsProps {
  trainerId: string;
  trainerName: string;
  whatsappNumber: string;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrainerContactButtons({
  trainerId,
  trainerName,
  whatsappNumber,
  email,
  size = "md",
  className,
}: TrainerContactButtonsProps) {
  const whatsappUrl = buildTrainerWhatsAppUrl(whatsappNumber, trainerName);
  const phoneHref = `tel:${whatsappNumber.replace(/\s/g, "")}`;

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5 rounded-xl",
    md: "h-10 px-4 text-sm gap-2 rounded-xl",
    lg: "h-12 px-6 text-sm gap-2.5 rounded-xl font-bold",
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-trainer-id={trainerId}
        data-lead-event="WHATSAPP_CLICK"
        className={cn(
          "inline-flex items-center justify-center font-semibold bg-[#25D366] text-white hover:bg-[#1da851] transition-all",
          sizes[size],
          "flex-1"
        )}
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        WhatsApp
      </a>
      <a
        href={phoneHref}
        data-trainer-id={trainerId}
        data-lead-event="PHONE_CLICK"
        className={cn(
          "inline-flex items-center justify-center font-semibold bg-[#0B2545] text-white hover:bg-[#071832] transition-all",
          sizes[size],
          "flex-1"
        )}
      >
        <Phone className="w-4 h-4 shrink-0" />
        Call
      </a>
      {email && (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`Training inquiry — ${trainerName}`)}`}
          data-trainer-id={trainerId}
          data-lead-event="CONTACT_CLICK"
          className={cn(
            "inline-flex items-center justify-center font-semibold bg-[var(--bg)] text-[#0B2545] border border-[var(--border)] hover:border-[#0B2545] transition-all",
            sizes[size],
            "flex-1"
          )}
        >
          Email
        </a>
      )}
    </div>
  );
}
