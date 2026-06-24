"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FAQ_ANSWER_MAX,
  FAQ_QUESTION_MAX,
  type FaqFormInput,
  type FaqItem,
} from "@/lib/validations/faq";

type FaqActionResult =
  | { success: true; data?: { id: string } | undefined }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

interface FaqFormProps {
  faq?: FaqItem;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmit: (input: FaqFormInput) => Promise<FaqActionResult>;
}

const EMPTY_FORM: FaqFormInput = {
  question: "",
  answer: "",
  isActive: true,
};

function faqToForm(faq: FaqItem): FaqFormInput {
  return {
    question: faq.question,
    answer: faq.answer,
    isActive: faq.isActive,
  };
}

export function FaqForm({ faq, onCancel, onSuccess, onSubmit }: FaqFormProps) {
  const [form, setForm] = useState<FaqFormInput>(faq ? faqToForm(faq) : EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FaqFormInput>(key: K, value: FaqFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await onSubmit(form);
      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        return;
      }
      onSuccess();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 space-y-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-[var(--text)]">
            {faq ? "Edit FAQ" : "Add FAQ"}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Questions and answers shown on your public profile when FAQs are enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
          aria-label="Close form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="faq-question" className="block text-sm font-semibold text-[var(--text)] mb-1.5">
          Question
        </label>
        <input
          id="faq-question"
          type="text"
          value={form.question}
          onChange={(e) => updateField("question", e.target.value)}
          maxLength={FAQ_QUESTION_MAX}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border bg-[var(--bg)] text-[var(--text)] text-sm",
            fieldErrors.question ? "border-red-300" : "border-[var(--border)]"
          )}
          placeholder="e.g. Do you offer trial sessions?"
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.question ? (
            <p className="text-xs text-red-600">{fieldErrors.question}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[var(--text-muted)]">
            {form.question.length}/{FAQ_QUESTION_MAX}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="faq-answer" className="block text-sm font-semibold text-[var(--text)] mb-1.5">
          Answer
        </label>
        <textarea
          id="faq-answer"
          value={form.answer}
          onChange={(e) => updateField("answer", e.target.value)}
          maxLength={FAQ_ANSWER_MAX}
          rows={5}
          className={cn(
            "w-full px-4 py-2.5 rounded-xl border bg-[var(--bg)] text-[var(--text)] text-sm resize-y min-h-[120px]",
            fieldErrors.answer ? "border-red-300" : "border-[var(--border)]"
          )}
          placeholder="Write a clear, helpful answer for visitors."
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.answer ? (
            <p className="text-xs text-red-600">{fieldErrors.answer}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[var(--text-muted)]">
            {form.answer.length}/{FAQ_ANSWER_MAX}
          </p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => updateField("isActive", e.target.checked)}
          className="w-4 h-4 rounded border-[var(--border)] text-[#FF6A3D] focus:ring-[#FF6A3D]/30"
        />
        <span className="text-sm text-[var(--text)]">
          Show this question on the public profile
        </span>
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] disabled:opacity-60 transition-colors"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {faq ? "Save Changes" : "Add FAQ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
