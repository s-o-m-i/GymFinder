import { redirect } from "next/navigation";
import { ChevronLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { AdminEventForm } from "@/components/admin/AdminEventForm";
import { getAdminEventById, getApprovedGymsForEventForm } from "@/services/events/event.service";

interface AdminEditEventPageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function AdminEditEventPage({ params }: AdminEditEventPageProps) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const [event, gyms] = await Promise.all([
    getAdminEventById(params.id),
    getApprovedGymsForEventForm(),
  ]);

  if (!event) redirect("/admin/events");

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
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Edit Event</h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Update event details or remove owner-submitted events as needed.
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <AdminEventForm mode="edit" event={event} gyms={gyms} />
      </div>
    </div>
  );
}
