"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import type { GymClaimPosition, GymClaimStatus, ListingStatus } from "@prisma/client";
import {
  approveGymClaimAction,
  rejectGymClaimAction,
} from "@/app/actions/admin/gym-claims";
import {
  GYM_CLAIM_POSITION_LABELS,
  GYM_CLAIM_STATUS_LABELS,
  GYM_CLAIM_STATUS_STYLES,
} from "@/lib/gym-claim/constants";
import { cn, formatRegistrationDate } from "@/lib/utils";

interface AdminGymClaimDetailProps {
  claim: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    whatsapp: string;
    position: GymClaimPosition;
    instagramUrl: string | null;
    facebookUrl: string | null;
    message: string | null;
    status: GymClaimStatus;
    submittedAt: Date | string;
    reviewedAt: Date | string | null;
    adminNotes: string | null;
    rejectionReason: string | null;
    gym: {
      id: string;
      name: string;
      slug: string;
      city: string;
      area: string;
      address: string;
      whatsappNumber: string;
      listingStatus: ListingStatus;
      claimed: boolean;
    };
    claimant: { id: string; name: string; email: string; phone: string | null } | null;
  };
}

const CHECKLIST = [
  "Phone number matches the gym listing",
  "WhatsApp matches the listing",
  "Phone number appears on official Instagram/Facebook",
  "Social links belong to the gym",
  "Additional notes",
];

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#FF6A3D] hover:underline break-all">
          {value}
        </a>
      ) : (
        <span className="text-sm font-medium text-[var(--text)] break-all">{value}</span>
      )}
    </div>
  );
}

export function AdminGymClaimDetail({ claim }: AdminGymClaimDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState(claim.adminNotes ?? "");
  const [showReject, setShowReject] = useState(false);

  const isPendingClaim = claim.status === "PENDING";

  function handleApprove() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await approveGymClaimAction(claim.id);
      if (result.success) setMessage("Claim approved. Owner now has dashboard access.");
      else setError(result.error);
    });
  }

  function handleReject() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await rejectGymClaimAction(claim.id, {
        rejectionReason: rejectionReason || undefined,
        adminNotes: adminNotes || undefined,
      });
      if (result.success) {
        setMessage("Claim rejected.");
        setShowReject(false);
      } else setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/claims" className="text-sm text-[var(--text-muted)] hover:text-[#FF6A3D]">
            ← Back to claims
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--text)]">Claim Details</h1>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
            GYM_CLAIM_STATUS_STYLES[claim.status]
          )}
        >
          {GYM_CLAIM_STATUS_LABELS[claim.status]}
        </span>
      </div>

      {(message || error) && (
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          )}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text)]">Gym Information</h2>
          <div className="space-y-3">
            <InfoRow label="Gym name" value={claim.gym.name} />
            <InfoRow label="City" value={`${claim.gym.area}, ${claim.gym.city}`} />
            <InfoRow label="Address" value={claim.gym.address} />
            <InfoRow label="Current WhatsApp" value={claim.gym.whatsappNumber} />
            <InfoRow label="Listing status" value={claim.gym.listingStatus} />
            <InfoRow label="Claimed" value={claim.gym.claimed ? "Yes" : "No"} />
          </div>
          <Link
            href={`/gyms/${claim.gym.slug}`}
            target="_blank"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A3D] hover:underline"
          >
            View public profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text)]">Applicant Information</h2>
          <div className="space-y-3">
            <InfoRow label="Full name" value={claim.fullName} />
            <InfoRow label="Business email" value={claim.email} />
            <InfoRow label="Business phone" value={claim.phone} />
            <InfoRow label="Official WhatsApp" value={claim.whatsapp} />
            <InfoRow label="Position" value={GYM_CLAIM_POSITION_LABELS[claim.position]} />
            {claim.instagramUrl && (
              <InfoRow label="Instagram" value={claim.instagramUrl} href={claim.instagramUrl} />
            )}
            {claim.facebookUrl && (
              <InfoRow label="Facebook" value={claim.facebookUrl} href={claim.facebookUrl} />
            )}
            {claim.claimant && (
              <InfoRow label="Account email" value={claim.claimant.email} />
            )}
            <InfoRow label="Submitted" value={formatRegistrationDate(claim.submittedAt)} />
          </div>
          {claim.message && (
            <div className="mt-4 rounded-xl bg-[var(--bg)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Message</p>
              <p className="mt-2 text-sm text-[var(--text)] whitespace-pre-wrap">{claim.message}</p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text)]">Verification Checklist</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Manual verification guide — compare applicant details with the gym listing and social profiles.
        </p>
        <ul className="space-y-2">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[var(--text)]">
              <span className="text-emerald-600">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <label className="mt-4 block text-sm font-medium text-[var(--text)]">Admin notes</label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          disabled={!isPendingClaim}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm disabled:opacity-60"
          placeholder="Internal notes for your team..."
        />
      </section>

      {isPendingClaim && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleApprove}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowReject((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {showReject && isPendingClaim && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <label className="block text-sm font-medium text-[var(--text)]">Rejection reason (optional)</label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="Unable to verify business ownership."
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleReject}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Confirm Reject
          </button>
        </div>
      )}

      {claim.rejectionReason && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
          <strong>Rejection reason:</strong> {claim.rejectionReason}
        </div>
      )}
    </div>
  );
}
