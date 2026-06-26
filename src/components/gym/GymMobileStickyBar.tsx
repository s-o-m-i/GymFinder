"use client";

import { WhatsAppButton } from "@/components/gym/WhatsAppButton";
import { CallGymButton } from "@/components/gym/CallGymButton";

interface GymMobileStickyBarProps {
  gymId: string;
  gymName: string;
}

export function GymMobileStickyBar({ gymId, gymName }: GymMobileStickyBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Contact gym"
    >
      <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3">
        <WhatsAppButton
          gymId={gymId}
          gymName={gymName}
          size="md"
          fullWidth
          captureLead
          label="WhatsApp Gym"
          className="flex-1 min-w-0"
        />
        <CallGymButton gymId={gymId} size="md" fullWidth label="Call Gym" className="flex-1 min-w-0" />
      </div>
    </div>
  );
}
