export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { SuccessStoryWizard } from "@/components/success-stories/SuccessStoryWizard";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerNewSuccessStoryPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await prisma.gym.findUnique({
    where: { ownerId: session.ownerId },
    select: { id: true },
  });
  if (!gym) redirect("/owner/dashboard");

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="font-heading mb-6 text-2xl font-bold text-[var(--text)]">Create success story</h1>
      <SuccessStoryWizard dashboardPath="/owner/success-stories" />
    </div>
  );
}
