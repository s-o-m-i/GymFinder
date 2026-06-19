"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const OWNER_GYM_STEPS = [
  { id: 1, title: "Basics", short: "Basics" },
  { id: 2, title: "Location", short: "Location" },
  { id: 3, title: "Pricing & Hours", short: "Pricing" },
  { id: 4, title: "Details", short: "Details" },
  { id: 5, title: "Offerings", short: "Offerings" },
  { id: 6, title: "Photos", short: "Photos" },
] as const;

interface OwnerGymStepIndicatorProps {
  currentStep: number;
  completedSteps?: ReadonlySet<number>;
  onStepClick?: (step: number) => void;
}

export function OwnerGymStepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: OwnerGymStepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="hidden md:flex items-center w-full">
        {OWNER_GYM_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isComplete =
            !isActive &&
            (step.id < currentStep || (completedSteps?.has(step.id) ?? false));
          const canJump = isComplete && !!onStepClick;
          const connectorComplete = isComplete;

          return (
            <Fragment key={step.id}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onStepClick?.(step.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 shrink-0 w-[4.75rem]",
                  canJump && "cursor-pointer hover:opacity-80",
                  !canJump && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                    isComplete && "bg-[#0B2545] border-[#0B2545] text-white",
                    isActive && "bg-[#FF6A3D] border-[#FF6A3D] text-white",
                    !isComplete &&
                      !isActive &&
                      "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)]"
                  )}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold text-center leading-tight w-full px-0.5",
                    isActive ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                  )}
                >
                  {step.short}
                </span>
              </button>

              {index < OWNER_GYM_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1 min-w-[1.25rem] mx-1.5 rounded-full self-center mb-5",
                    connectorComplete ? "bg-[#0B2545]" : "bg-[var(--border)]"
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2">
          <span>
            Step {currentStep} of {OWNER_GYM_STEPS.length}
          </span>
          <span>{Math.round((currentStep / OWNER_GYM_STEPS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF6A3D] transition-all duration-300"
            style={{ width: `${(currentStep / OWNER_GYM_STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 font-heading font-bold text-[var(--text)]">
          {OWNER_GYM_STEPS[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
}
