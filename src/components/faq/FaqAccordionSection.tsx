"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/validations/faq";

interface FaqAccordionSectionProps {
  faqs: Pick<FaqItem, "id" | "question" | "answer">[];
  title?: string;
}

export function FaqAccordionSection({
  faqs,
  title = "Frequently Asked Questions",
}: FaqAccordionSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[#FF6A3D]" />
        {title}
      </h2>

      <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="bg-[var(--bg)]">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left hover:bg-[var(--card)] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-[var(--text)] text-sm sm:text-base pr-2">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 shrink-0 text-[var(--text-muted)] transition-transform mt-0.5",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
