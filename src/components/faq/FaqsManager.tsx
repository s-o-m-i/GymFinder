"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { FaqForm } from "@/components/faq/FaqForm";
import { FaqsEnabledToggle } from "@/components/faq/FaqsEnabledToggle";
import type { FaqFormInput, FaqItem } from "@/lib/validations/faq";
import { cn } from "@/lib/utils";

type FaqActionResult =
  | { success: true; data?: { id: string } | undefined }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

interface FaqsManagerProps {
  subjectName: string;
  faqsEnabled: boolean;
  initialFaqs: FaqItem[];
  onUpdateEnabled: (enabled: boolean) => Promise<FaqActionResult>;
  onCreate: (input: FaqFormInput) => Promise<FaqActionResult>;
  onUpdate: (faqId: string, input: FaqFormInput) => Promise<FaqActionResult>;
  onDelete: (faqId: string) => Promise<FaqActionResult>;
  onReorder: (orderedIds: string[]) => Promise<FaqActionResult>;
}

export function FaqsManager({
  subjectName,
  faqsEnabled,
  initialFaqs,
  onUpdateEnabled,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
}: FaqsManagerProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(faqsEnabled);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);

  useEffect(() => {
    setEnabled(faqsEnabled);
  }, [faqsEnabled]);

  function openCreate() {
    setEditingFaq(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(faq: FaqItem) {
    setEditingFaq(faq);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingFaq(null);
  }

  function handleFormSuccess() {
    closeForm();
    router.refresh();
  }

  async function handleToggleEnabled(next: boolean) {
    setTogglingEnabled(true);
    setError(null);
    const result = await onUpdateEnabled(next);
    setTogglingEnabled(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setEnabled(next);
    router.refresh();
  }

  async function handleDelete(faq: FaqItem) {
    if (!confirm(`Delete "${faq.question}"?`)) return;

    setDeletingId(faq.id);
    setError(null);

    startTransition(async () => {
      const result = await onDelete(faq.id);
      if (!result.success) {
        setError(result.error);
        setDeletingId(null);
        return;
      }
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      if (editingFaq?.id === faq.id) closeForm();
      setDeletingId(null);
      router.refresh();
    });
  }

  async function moveFaq(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const reordered = [...faqs];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);

    setFaqs(reordered);
    setReordering(true);
    setError(null);

    const result = await onReorder(reordered.map((f) => f.id));
    setReordering(false);

    if (!result.success) {
      setError(result.error);
      setFaqs(initialFaqs);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <FaqsEnabledToggle
        enabled={enabled}
        onChange={handleToggleEnabled}
        disabled={togglingEnabled || isPending}
      />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            FAQs for <span className="font-medium text-[var(--text)]">{subjectName}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {faqs.length} question{faqs.length === 1 ? "" : "s"} · Use arrows to reorder
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {showForm && (
        <FaqForm
          faq={editingFaq ?? undefined}
          onCancel={closeForm}
          onSuccess={handleFormSuccess}
          onSubmit={(input) =>
            editingFaq ? onUpdate(editingFaq.id, input) : onCreate(input)
          }
        />
      )}

      {faqs.length === 0 && !showForm ? (
        <div className="bg-[var(--card)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-[#0B2545]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-[#0B2545]" />
          </div>
          <p className="font-heading font-bold text-[var(--text)] mb-2">No FAQs yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-5 max-w-sm mx-auto">
            Add common questions about pricing, timings, and membership so visitors can find answers quickly.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First FAQ
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className={cn(
                "bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5",
                !faq.isActive && "opacity-70"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md",
                        faq.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {faq.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-[var(--text)]">{faq.question}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-3 whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col mr-1">
                    <button
                      type="button"
                      disabled={index === 0 || reordering || isPending}
                      onClick={() => moveFaq(index, "up")}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === faqs.length - 1 || reordering || isPending}
                      onClick={() => moveFaq(index, "down")}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(faq)}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                    aria-label={`Edit ${faq.question}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq)}
                    disabled={deletingId === faq.id || isPending}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    aria-label={`Delete ${faq.question}`}
                  >
                    {deletingId === faq.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
