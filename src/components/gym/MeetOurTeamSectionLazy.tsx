"use client";

import dynamic from "next/dynamic";
import type { StaffMember } from "@prisma/client";

const MeetOurTeamSection = dynamic(
  () =>
    import("@/components/gym/MeetOurTeamSection").then((m) => m.MeetOurTeamSection),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
    ),
  }
);

interface MeetOurTeamSectionLazyProps {
  members: StaffMember[];
  className?: string;
}

export function MeetOurTeamSectionLazy(props: MeetOurTeamSectionLazyProps) {
  return <MeetOurTeamSection {...props} />;
}
