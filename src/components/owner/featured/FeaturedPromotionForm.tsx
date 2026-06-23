"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";
import { submitFeatureRequest } from "@/app/actions/owner/feature-requests";
import { formatPlanAmount } from "@/lib/featured-payment-config";
import { cn } from "@/lib/utils";
import type { FeaturedPlan } from "@prisma/client";

export type FeaturedPaymentConfig = {
  jazzCashNumber: string;
  easypaisaNumber: string;
  currency: string;
};

interface FeaturedPromotionFormProps {
  plans: FeaturedPlan[];
  hasPendingRequest: boolean;
  paymentConfig: FeaturedPaymentConfig;
}

export function FeaturedPromotionForm({ plans, hasPendingRequest, paymentConfig }: FeaturedPromotionFormProps) {
  const payment = paymentConfig;
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"jazzcash" | "easypaisa">("jazzcash");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    if (!screenshot[0]) {
      setFieldErrors({ screenshotUrl: "Upload a payment screenshot" });
      return;
    }

    startTransition(async () => {
      const result = await submitFeatureRequest({
        planId: selectedPlanId,
        paymentMethod,
        transactionId,
        screenshotUrl: screenshot[0].imageUrl,
        screenshotPublicId: screenshot[0].publicId ?? "",
        notes: notes || undefined,
      });

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setSuccess(true);
      setTransactionId("");
      setNotes("");
      setScreenshot([]);
    });
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--text-muted)]">
        No promotion plans are available right now. Please check back later.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Plans */}
      <div>
        <h2 className="font-heading mb-4 text-lg font-bold text-[var(--text)]">Choose a Plan</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlanId(plan.id)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  selected
                    ? "border-[#FF6A3D] bg-[#FF6A3D]/5 shadow-md"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[#FF6A3D]/30"
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-[var(--text)]">{plan.name}</h3>
                  {selected && <Sparkles className="h-4 w-4 text-[#FF6A3D]" />}
                </div>
                <p className="mb-3 text-2xl font-bold text-[#FF6A3D]">{formatPlanAmount(plan.amount)}</p>
                <ul className="space-y-1.5">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A3D]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment instructions */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-heading mb-3 text-lg font-bold text-[var(--text)]">Payment Instructions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">JazzCash</p>
            <p className="font-mono-nums mt-1 text-lg font-bold text-[var(--text)]">{payment.jazzCashNumber}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Easypaisa</p>
            <p className="font-mono-nums mt-1 text-lg font-bold text-[var(--text)]">{payment.easypaisaNumber}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Send <strong>{selectedPlan ? formatPlanAmount(selectedPlan.amount) : "the plan amount"}</strong> to one of
          the numbers above. Then upload your payment screenshot and transaction ID below.
        </p>
      </div>

      {hasPendingRequest && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You already have a pending request. Please wait for admin approval before submitting another.
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Request submitted successfully. We&apos;ll review your payment and activate featured status soon.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Submission fields */}
      <div className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-heading text-lg font-bold text-[var(--text)]">Submit Payment Proof</h2>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text)]">Payment Method</label>
          <div className="flex flex-wrap gap-3">
            {(["jazzcash", "easypaisa"] as const).map((method) => (
              <label
                key={method}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize",
                  paymentMethod === method
                    ? "border-[#FF6A3D] bg-[#FF6A3D]/10 text-[#FF6A3D]"
                    : "border-[var(--border)] text-[var(--text-muted)]"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="sr-only"
                />
                {method}
              </label>
            ))}
          </div>
          {fieldErrors.paymentMethod && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.paymentMethod}</p>
          )}
        </div>

        <div>
          <label htmlFor="transactionId" className="mb-2 block text-sm font-medium text-[var(--text)]">
            Transaction ID
          </label>
          <input
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm focus:border-[#FF6A3D]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
            placeholder="Enter JazzCash / Easypaisa transaction ID"
            disabled={hasPendingRequest || isPending}
          />
          {fieldErrors.transactionId && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.transactionId}</p>
          )}
        </div>

        <ImageUploader
          label="Payment Screenshot"
          description="Upload a clear screenshot of your payment confirmation"
          images={screenshot}
          onChange={setScreenshot}
          multiple={false}
          maxImages={1}
          uploadType="payment_proof"
          authMode="cookie"
          previewAspect="portrait"
        />
        {fieldErrors.screenshotUrl && (
          <p className="text-xs text-red-600">{fieldErrors.screenshotUrl}</p>
        )}

        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-[var(--text)]">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm focus:border-[#FF6A3D]/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/20"
            placeholder="Any extra details for the admin team"
            disabled={hasPendingRequest || isPending}
          />
        </div>

        <button
          type="submit"
          disabled={hasPendingRequest || isPending || !selectedPlanId}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#FF6A3D] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e85528] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isPending ? "Submitting…" : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
