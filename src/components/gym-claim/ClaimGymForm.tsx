"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GYM_CLAIM_POSITION_LABELS } from "@/lib/gym-claim/constants";
import { submitGymClaimAction } from "@/app/actions/gym-claim/submit";
import type { GymClaimPosition } from "@prisma/client";

const POSITIONS = Object.entries(GYM_CLAIM_POSITION_LABELS) as [GymClaimPosition, string][];

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] focus:border-[#FF6A3D] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20";

interface ClaimGymFormProps {
  gymId: string;
  gymName: string;
  defaultFullName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultWhatsapp?: string;
}

export function ClaimGymForm({
  gymId,
  gymName,
  defaultFullName = "",
  defaultEmail = "",
  defaultPhone = "",
  defaultWhatsapp = "",
}: ClaimGymFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: defaultFullName,
    email: defaultEmail,
    phone: defaultPhone,
    whatsapp: defaultWhatsapp,
    position: "OWNER" as GymClaimPosition,
    instagramUrl: "",
    facebookUrl: "",
    message: "",
    authorized: false,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await submitGymClaimAction({
        gymId,
        ...form,
        instagramUrl: form.instagramUrl || undefined,
        facebookUrl: form.facebookUrl || undefined,
        message: form.message || undefined,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="font-heading text-xl font-bold text-emerald-900">Your claim has been submitted.</p>
        <p className="mt-3 text-sm text-emerald-800">
          Our team will verify your information and contact you if necessary.
        </p>
        <Link
          href="/owner/dashboard"
          className="mt-6 inline-flex rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#071832]"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-[var(--text-muted)]">
        Submit a claim to manage <strong className="text-[var(--text)]">{gymName}</strong>.
      </p>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            className={cn(inputClass, fieldErrors.fullName && "border-red-300")}
            required
          />
          {fieldErrors.fullName && <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Business Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={cn(inputClass, fieldErrors.email && "border-red-300")}
            required
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Business Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={cn(inputClass, fieldErrors.phone && "border-red-300")}
            required
          />
          {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Official WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            value={form.whatsapp}
            onChange={(e) => setField("whatsapp", e.target.value)}
            className={cn(inputClass, fieldErrors.whatsapp && "border-red-300")}
            required
          />
          {fieldErrors.whatsapp && <p className="mt-1 text-xs text-red-600">{fieldErrors.whatsapp}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">
            Position <span className="text-red-500">*</span>
          </label>
          <select
            value={form.position}
            onChange={(e) => setField("position", e.target.value as GymClaimPosition)}
            className={inputClass}
          >
            {POSITIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Instagram URL</label>
          <input
            value={form.instagramUrl}
            onChange={(e) => setField("instagramUrl", e.target.value)}
            placeholder="https://instagram.com/..."
            className={cn(inputClass, fieldErrors.instagramUrl && "border-red-300")}
          />
          {fieldErrors.instagramUrl && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.instagramUrl}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Facebook URL</label>
          <input
            value={form.facebookUrl}
            onChange={(e) => setField("facebookUrl", e.target.value)}
            placeholder="https://facebook.com/..."
            className={cn(inputClass, fieldErrors.facebookUrl && "border-red-300")}
          />
          {fieldErrors.facebookUrl && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.facebookUrl}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
            rows={4}
            placeholder="I am the owner of this gym."
            className={cn(inputClass, "resize-y")}
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <input
          type="checkbox"
          checked={form.authorized}
          onChange={(e) => setField("authorized", e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[#FF6A3D]"
        />
        <span className="text-sm text-[var(--text-muted)]">
          I confirm that I am authorized to manage this gym.
        </span>
      </label>
      {fieldErrors.authorized && (
        <p className="text-xs text-red-600">{fieldErrors.authorized}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A3D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e85528] disabled:opacity-60 sm:w-auto"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Claim
      </button>
    </form>
  );
}
