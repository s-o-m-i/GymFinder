"use client";

import { useState } from "react";
import type { MembershipPlan } from "@prisma/client";
import { CheckCircle2, CreditCard } from "lucide-react";
import {
  formatMembershipPrice,
  parseFeaturesText,
} from "@/lib/membership-plans";
import { cn } from "@/lib/utils";

const DESCRIPTION_CHAR_LIMIT = 120;

interface PlanDescriptionProps {
  text: string;
}

function PlanDescription({ text }: PlanDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > DESCRIPTION_CHAR_LIMIT;

  return (
    <div className="mt-2">
      <p
        className={cn(
          "text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words",
          !expanded && isLong && "line-clamp-3"
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-semibold text-[#FF6A3D] mt-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/30 rounded"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

interface MembershipPlansSectionProps {
  plans: MembershipPlan[];
  gymName: string;
  className?: string;
}

export function MembershipPlansSection({ plans, gymName, className }: MembershipPlansSectionProps) {
  if (plans.length === 0) return null;

  return (
    <div className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 ${className ?? ""}`}>
      <h3 className="font-heading font-bold text-[var(--text)] mb-1 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-[#FF6A3D]" />
        Membership Plans
      </h3>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Pricing options at {gymName}
      </p>

      <div className="space-y-3">
        {plans.map((plan) => {
          const features = parseFeaturesText(plan.features);
          return (
            <div
              key={plan.id}
              className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading font-bold text-sm text-[var(--text)]">
                    {plan.name}
                  </p>
                  <p className="font-mono-nums text-[#FF6A3D] font-semibold text-sm mt-0.5">
                    {formatMembershipPrice(plan.price, plan.duration)}
                  </p>
                </div>
              </div>

              {plan.description && <PlanDescription text={plan.description} />}

              {features.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-[var(--text-muted)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A3D] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
