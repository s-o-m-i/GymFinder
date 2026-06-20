"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MembershipDuration, MembershipPlan } from "@prisma/client";
import {
  AlertCircle,
  Crown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  FREE_MEMBERSHIP_PLAN_LIMIT,
  MEMBERSHIP_DURATION_OPTIONS,
  formatMembershipPrice,
  parseFeaturesText,
} from "@/lib/membership-plans";

interface OwnerMembershipPlansManagerProps {
  gymName: string;
  initialPlans: MembershipPlan[];
  isPremium: boolean;
}

type PlanFormState = {
  name: string;
  description: string;
  price: string;
  duration: MembershipDuration;
  features: string;
};

const EMPTY_FORM: PlanFormState = {
  name: "",
  description: "",
  price: "",
  duration: "monthly",
  features: "",
};

function planToForm(plan: MembershipPlan): PlanFormState {
  return {
    name: plan.name,
    description: plan.description ?? "",
    price: String(plan.price),
    duration: plan.duration,
    features: plan.features ?? "",
  };
}

export function OwnerMembershipPlansManager({
  gymName,
  initialPlans,
  isPremium,
}: OwnerMembershipPlansManagerProps) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const atFreeLimit = !isPremium && plans.length >= FREE_MEMBERSHIP_PLAN_LIMIT;
  const remainingFree = Math.max(0, FREE_MEMBERSHIP_PLAN_LIMIT - plans.length);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(plan: MembershipPlan) {
    setEditingId(plan.id);
    setForm(planToForm(plan));
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      duration: form.duration,
      features: form.features.trim() || null,
    };

    try {
      const url = editingId
        ? `/api/owner/memberships/${editingId}`
        : "/api/owner/memberships";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (editingId) {
        setPlans((prev) =>
          prev.map((p) => (p.id === editingId ? data.data : p))
        );
      } else {
        setPlans((prev) => [...prev, data.data]);
      }

      closeForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(planId: string) {
    if (!confirm("Delete this membership plan? This cannot be undone.")) return;

    setDeletingId(planId);
    setError(null);

    try {
      const res = await fetch(`/api/owner/memberships/${planId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to delete plan.");
        return;
      }

      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (editingId === planId) closeForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            Plans for <span className="font-medium text-[var(--text)]">{gymName}</span>
          </p>
          {!isPremium && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {remainingFree > 0
                ? `${remainingFree} of ${FREE_MEMBERSHIP_PLAN_LIMIT} free plans remaining`
                : `Free limit reached (${FREE_MEMBERSHIP_PLAN_LIMIT}/${FREE_MEMBERSHIP_PLAN_LIMIT})`}
            </p>
          )}
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreateForm}
            disabled={atFreeLimit}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        )}
      </div>

      {atFreeLimit && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#0B2545] to-[#1a3a5c] text-white rounded-2xl">
          <Crown className="w-5 h-5 text-[#FF6A3D] shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-bold text-sm">Want more membership plans?</p>
            <p className="text-sm text-white/80 mt-1">
              You&apos;ve reached the free limit of {FREE_MEMBERSHIP_PLAN_LIMIT} plans.
              To create more membership plans, purchase Premium for your account.
            </p>
            <button
              type="button"
              disabled
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#FF6A3D] text-white text-xs font-semibold rounded-lg opacity-80 cursor-not-allowed"
            >
              <Crown className="w-3.5 h-3.5" />
              Upgrade to Premium — Coming Soon
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading font-bold text-lg text-[var(--text)]">
              {editingId ? "Edit Plan" : "New Membership Plan"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                Plan Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Basic, Premium, Fighter Pass"
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                Price (PKR)
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="5000"
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                Billing Period
              </label>
              <select
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duration: e.target.value as MembershipDuration,
                  }))
                }
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30"
              >
                {MEMBERSHIP_DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                Description <span className="font-normal text-[var(--text-muted)]">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short summary of who this plan is for…"
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                Features <span className="font-normal text-[var(--text-muted)]">(one per line, optional)</span>
              </label>
              <textarea
                rows={4}
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                placeholder={"Unlimited gym access\nLocker included\nGroup classes"}
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Save Changes" : "Create Plan"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-5 py-2.5 text-sm font-semibold text-[var(--text-muted)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {plans.length === 0 && !showForm ? (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <p className="font-heading font-bold text-[var(--text)] mb-2">No membership plans yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-5 max-w-sm mx-auto">
            Add up to {FREE_MEMBERSHIP_PLAN_LIMIT} plans for free so visitors can see your pricing on your public listing page.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => {
            const featureList = parseFeaturesText(plan.features);
            return (
              <div
                key={plan.id}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-[var(--text)]">{plan.name}</h3>
                    <p className="font-mono-nums text-[#FF6A3D] font-semibold text-sm mt-1">
                      {formatMembershipPrice(plan.price, plan.duration)}
                    </p>
                    {plan.description && (
                      <p className="text-sm whitespace-pre-line break-words break-all text-[var(--text-muted)] mt-2">{plan.description}</p>
                    )}
                    {featureList.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {featureList.map((feature) => (
                          <li
                            key={feature}
                            className="text-sm text-[var(--text-muted)] flex items-start gap-2"
                          >
                            <span className="text-[#FF6A3D] ">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditForm(plan)}
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                      aria-label={`Edit ${plan.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletingId === plan.id}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label={`Delete ${plan.name}`}
                    >
                      {deletingId === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
