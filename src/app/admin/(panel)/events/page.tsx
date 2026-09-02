import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getAdminEvents } from "@/services/events/event.service";
import { AdminEventsTable } from "@/components/admin/AdminEventsTable";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");

  const events = await getAdminEvents();
  const serializedEvents = events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() ?? null,
  }));

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Events</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Manage platform events, including owner-submitted events and admin-created events.
          </p>
        </div>
        <Link
          href="/admin/events/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Event
        </Link>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <AdminEventsTable events={serializedEvents} />
      </div>
    </div>
  );
}
