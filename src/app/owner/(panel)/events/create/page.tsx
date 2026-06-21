export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { OwnerEventForm } from "@/components/owner/events/OwnerEventForm";

export const metadata = {
  title: "Create Event | Owner Portal",
  robots: { index: false, follow: false },
};

async function getOwnerGym(ownerId: string) {
  return prisma.gym.findUnique({
    where: { ownerId },
    select: { city: true, area: true, address: true, name: true },
  });
}

export default async function OwnerCreateEventPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const gym = await getOwnerGym(session.ownerId);

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <Link
        href="/owner/events"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to events
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Create event</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          {gym
            ? `This event will be linked to ${gym.name}. It stays on the platform permanently for SEO.`
            : "Platform event — not linked to a gym listing yet. Add a listing to auto-link future events."}
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <OwnerEventForm
          gymDefaults={
            gym
              ? { city: gym.city, area: gym.area, address: gym.address }
              : null
          }
        />
      </div>
    </div>
  );
}
