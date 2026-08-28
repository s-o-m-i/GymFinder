import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, CalendarDays } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { getApprovedGymsForEventForm } from "@/services/events/event.service";

export const dynamic = "force-dynamic";

export default async function AdminAddEventPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const gyms = await getApprovedGymsForEventForm();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)] mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to events
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Create Event</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Publish an event on the platform. Admin events can be linked to an approved gym or published independently.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <AdminEventForm mode="create" event={null} gyms={gyms} />
      </div>
    </div>
  );
}
