"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  createFeaturedPlanAction,
  toggleFeaturedPlanActiveAction,
  updateFeaturedPlanAction,
} from "@/app/actions/admin/featured-plans";
import { deleteFeaturedPlanAction } from "@/app/actions/admin/feature-requests";
import { formatPlanAmount } from "@/lib/featured-payment-config";
import { cn } from "@/lib/utils";
import type { FeaturedPlan } from "@prisma/client";

interface AdminFeaturedPlansManagerProps {
  initialPlans: FeaturedPlan[];
}

type PlanFormState = {
  slug: string;
  name: string;
  durationDays: string;
  amount: string;
  benefitsText: string;
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: PlanFormState = {
  slug: "",
  name: "",
  durationDays: "7",
  amount: "999",
  benefitsText: "",
  isActive: true,
  sortOrder: "0",
};

function planToForm(plan: FeaturedPlan): PlanFormState {
  return {
    slug: plan.slug,
    name: plan.name,
    durationDays: String(plan.durationDays),
    amount: String(plan.amount),
    benefitsText: plan.benefits.join("\n"),
    isActive: plan.isActive,
    sortOrder: String(plan.sortOrder),
  };
}

export function AdminFeaturedPlansManager({ initialPlans }: AdminFeaturedPlansManagerProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startCreate() {
    setEditingId("new");
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(plan: FeaturedPlan) {
    setEditingId(plan.id);
    setForm(planToForm(plan));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function handleSave() {
    const benefits = form.benefitsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      slug: form.slug,
      name: form.name,
      durationDays: Number(form.durationDays),
      amount: Number(form.amount),
      benefits,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    };

    startTransition(async () => {
      const result =
        editingId === "new"
          ? await createFeaturedPlanAction(payload)
          : await updateFeaturedPlanAction(editingId!, payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    });
  }

  function handleToggle(plan: FeaturedPlan) {
    startTransition(async () => {
      await toggleFeaturedPlanActiveAction(plan.id, !plan.isActive);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
      );
    });
  }

  function handleDelete(planId: string) {
    if (!confirm("Remove this plan? Existing requests will keep historical data.")) return;
    startTransition(async () => {
      const result = await deleteFeaturedPlanAction(planId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--text)]">Featured Plans</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Create and manage promotion plans shown to gym owners.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A3D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e85528]"
        >
          <Plus className="h-4 w-4" />
          New Plan
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {(editingId === "new" || editingId) && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
          <h3 className="font-heading font-bold text-[var(--text)]">
            {editingId === "new" ? "Create Plan" : "Edit Plan"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="Slug (e.g. weekly)"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Plan name"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <input
              value={form.durationDays}
              onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
              placeholder="Duration (days)"
              type="number"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <input
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Amount (PKR)"
              type="number"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <input
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              placeholder="Sort order"
              type="number"
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
            />
            <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active for owners
            </label>
          </div>
          <textarea
            value={form.benefitsText}
            onChange={(e) => setForm((f) => ({ ...f, benefitsText: e.target.value }))}
            rows={4}
            placeholder="Benefits (one per line)"
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="rounded-xl bg-[#0B2545] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3060] disabled:opacity-50"
            >
              Save Plan
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text-muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-[var(--text)]">{plan.name}</h3>
                  {plan.isActive && <Sparkles className="h-4 w-4 text-[#FF6A3D]" />}
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {plan.slug} · {plan.durationDays} days · {formatPlanAmount(plan.amount)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  plan.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}
              >
                {plan.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <ul className="mb-4 space-y-1">
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6A3D]" />
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startEdit(plan)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleToggle(plan)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
              >
                {plan.isActive ? "Hide" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(plan.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
