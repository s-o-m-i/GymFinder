"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { EVENT_TYPES } from "@/lib/event-constants";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { UploadedImage } from "@/lib/gym-images-form";

interface OwnerEventFormProps {
  gymDefaults?: {
    city: string;
    area: string;
    address: string;
  } | null;
}

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/40";

const labelClass = "block text-sm font-semibold text-[var(--text)] mb-1.5";

export function OwnerEventForm({ gymDefaults }: OwnerEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "boxing",
    city: gymDefaults?.city ?? "Karachi",
    area: gymDefaults?.area ?? "",
    address: gymDefaults?.address ?? "",
    startDate: "",
    endDate: "",
    price: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cover = images[0];

    try {
      const res = await fetch("/api/owner/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          description: form.description || null,
          area: form.area || null,
          address: form.address || null,
          endDate: form.endDate || null,
          price: form.price ? parseInt(form.price, 10) : null,
          image: cover?.imageUrl ?? null,
          cloudinaryId: cover?.publicId ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create event.");
        return;
      }

      router.push("/owner/events");
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
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
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
          <label className={labelClass}>Area</label>
          <input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            placeholder="Bahria Town"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Price (PKR, optional)</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="Leave empty for free"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Address (optional override)</label>
        <input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder={gymDefaults?.address ?? "Event venue address"}
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
            value={form.endDate}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            className={inputClass}
          />
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
              Creating…
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4" />
              Publish event
            </>
          )}
        </button>
        <Link
          href="/owner/events"
          className="inline-flex items-center px-6 py-3 border border-[var(--border)] text-sm font-semibold rounded-xl hover:bg-[var(--bg)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
