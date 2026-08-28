"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { EVENT_TYPES } from "@/lib/event-constants";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";
import type { EventType } from "@prisma/client";

interface GymOption {
  id: string;
  name: string;
  city: string;
  area: string | null;
}

interface AdminEventFormProps {
  mode: "create" | "edit";
  event?: {
    id: string;
    title: string;
    description: string | null;
    type: EventType;
    city: string;
    area: string | null;
    address: string | null;
    startDate: string;
    endDate: string | null;
    price: number | null;
    isFeatured: boolean;
    gymId: string | null;
    image: string | null;
    cloudinaryId: string | null;
  } | null;
  gyms: GymOption[];
}

export function AdminEventForm({ mode, event, gyms }: AdminEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>(
    event?.image
      ? [
          {
            imageUrl: event.image,
            publicId: event.cloudinaryId ?? undefined,
            status: "uploaded",
            progress: 100,
          },
        ]
      : []
  );

  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    type: event?.type ?? "boxing",
    city: event?.city ?? CITIES[0],
    area: event?.area ?? "",
    address: event?.address ?? "",
    startDate: event?.startDate ?? "",
    endDate: event?.endDate ?? "",
    price: event?.price?.toString() ?? "",
    isFeatured: event?.isFeatured ?? false,
    gymId: event?.gymId ?? "",
  });

  const cover = images[0];

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/40";
  const labelClass = "block text-sm font-semibold text-[var(--text)] mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        title: form.title,
        description: form.description || null,
        type: form.type,
        city: form.city,
        area: form.area || null,
        address: form.address || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        price: form.price ? parseInt(form.price, 10) : null,
        isFeatured: form.isFeatured,
        gymId: form.gymId || null,
        image: cover?.imageUrl ?? null,
        cloudinaryId: cover?.publicId ?? null,
      };

      const url = mode === "create" ? "/api/admin/events" : `/api/admin/events/${event!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save event.");
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Event title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Summer Boxing Sparring Night"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={5}
          placeholder="Tell attendees what to expect…"
          className={`${inputClass} h-auto py-3 resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Event type *</label>
          <select
            required
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventType }))}
            className={inputClass}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <select
            required
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className={inputClass}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Gym (optional)</label>
          <select
            value={form.gymId ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, gymId: e.target.value }))}
            className={inputClass}
          >
            <option value="">No gym</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name} — {gym.area}, {gym.city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Area</label>
          <input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            placeholder="Bahria Town"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Event venue address"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start date & time *</label>
          <input
            type="datetime-local"
            required
            value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date & time</label>
          <input
            type="datetime-local"
            value={form.endDate ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price (PKR)</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="Leave empty for free"
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            id="isFeatured"
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            className="h-4 w-4 rounded border-[var(--border)] bg-[var(--card)] text-[#FF6A3D] focus:ring-[#FF6A3D]/40"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-[var(--text)]">
            Mark as featured
          </label>
        </div>
      </div>

      <div>
        <ImageUploader
          label="Event cover image"
          description="Recommended 16:9 image for listings and detail page."
          images={images}
          onChange={setImages}
          multiple={false}
          maxImages={1}
          uploadType="event_cover"
          authMode="cookie"
          previewAspect="video"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4" />
              {mode === "create" ? "Create event" : "Update event"}
            </>
          )}
        </button>
        <Link
          href="/admin/events"
          className="inline-flex items-center px-6 py-3 border border-[var(--border)] text-sm font-semibold rounded-xl hover:bg-[var(--bg)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
