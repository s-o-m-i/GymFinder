"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, X } from "lucide-react";
import type { GymLeadGoal } from "@prisma/client";
import { GYM_LEAD_GOALS } from "@/lib/gym-leads";
import { GYM_LEAD_CUSTOM_GOAL_MAX } from "@/lib/validations/gym-lead";
import { cn } from "@/lib/utils";

interface GymWhatsAppLeadModalProps {
  gymId: string;
  gymName: string;
  open: boolean;
  onClose: () => void;
}

export function GymWhatsAppLeadModal({
  gymId,
  gymName,
  open,
  onClose,
}: GymWhatsAppLeadModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<GymLeadGoal>("WEIGHT_LOSS");
  const [customGoal, setCustomGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOtherGoal = goal === "OTHER";
  const canSubmit =
    name.trim().length >= 2 &&
    (!isOtherGoal || customGoal.trim().length >= 2);

  useEffect(() => {
    if (!open) return;
    setError(null);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open && !submitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          gymId,
          name,
          goal,
          ...(isOtherGoal ? { customGoal: customGoal.trim() } : {}),
        }),
      });

      const data = (await res.json()) as { redirectUrl?: string; error?: string };

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (
        typeof window !== "undefined" &&
        (window as unknown as Record<string, unknown>).gtag
      ) {
        (
          window as unknown as Record<string, (...args: unknown[]) => void>
        ).gtag("event", "gym_lead_capture", {
          gym_name: gymName,
          gym_id: gymId,
          goal,
        });
      }

      window.location.href = data.redirectUrl;
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={() => !submitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gym-lead-modal-title"
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2
              id="gym-lead-modal-title"
              className="font-heading text-lg font-bold text-[var(--text)]"
            >
              Before you message {gymName}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Share your goal so the gym can help you faster on WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
          <div>
            <label htmlFor="lead-name" className="mb-1.5 block text-sm font-semibold text-[var(--text)]">
              Your name
            </label>
            <input
              id="lead-name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Khan"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
              autoFocus
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-[var(--text)]">
              Your goal
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {GYM_LEAD_GOALS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    option.value === "OTHER" && "col-span-2",
                    goal === option.value
                      ? "border-[#0B2545] bg-[#0B2545] text-white"
                      : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[#FF6A3D]/40"
                  )}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={option.value}
                    checked={goal === option.value}
                    onChange={() => {
                      setGoal(option.value);
                      if (option.value !== "OTHER") setCustomGoal("");
                    }}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {isOtherGoal && (
              <div className="mt-3">
                <label
                  htmlFor="lead-custom-goal"
                  className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
                >
                  Describe your goal
                </label>
                <input
                  id="lead-custom-goal"
                  type="text"
                  required
                  minLength={2}
                  maxLength={GYM_LEAD_CUSTOM_GOAL_MAX}
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. CrossFit, rehab, kids classes"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
                />
              </div>
            )}
          </fieldset>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1da851] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Continue to WhatsApp
          </button>

          <p className="text-center text-xs text-[var(--text-muted)]">
            Your details are shared with {gymName} via FitnessAdda PK.
          </p>
        </form>
      </div>
    </div>
  );
}
