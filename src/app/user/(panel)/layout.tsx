export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommunityPanelShell } from "@/components/community/CommunityPanelShell";
import { getCommunitySession } from "@/lib/community-auth";

export const metadata: Metadata = {
  title: "My Success Stories | FitnessAdda PK",
  robots: { index: false, follow: false },
};

export default async function UserPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getCommunitySession();
  if (!session) redirect("/user/login?from=/user/dashboard/success-stories");

  return (
    <CommunityPanelShell fullName={session.fullName}>{children}</CommunityPanelShell>
  );
}
