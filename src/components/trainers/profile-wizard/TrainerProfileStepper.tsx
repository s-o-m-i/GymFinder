"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { WIZARD_STEPS } from "@/components/trainers/profile-wizard/constants";

interface TrainerProfileStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function TrainerProfileStepper({ currentStep, onStepClick }: TrainerProfileStepperProps) {
  return (
    <div className="mb-8 min-w-0">
      {/* Desktop horizontal stepper */}
      <div className="hidden md:block">
        <div className="relative mb-3">
          <div className="absolute left-0 right-0 top-[1.125rem] h-0.5 bg-gray-200" aria-hidden />
          <div
            className="absolute left-0 top-[1.125rem] h-0.5 bg-[#FF6A3D] transition-all duration-300"
            style={{
              width: `${(currentStep / (WIZARD_STEPS.length - 1)) * 100}%`,
            }}
            aria-hidden
          />
          <ol className="relative grid grid-cols-6 gap-1">
            {WIZARD_STEPS.map((step, index) => {
              const isComplete = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = Boolean(onStepClick && index < currentStep);

              return (
                <li key={step.key} className="flex flex-col items-center">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick?.(index)}
                    className={cn(
                      "flex flex-col items-center gap-2 text-center",
                      isClickable ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                        isComplete && "border-[#FF6A3D] bg-[#FF6A3D] text-white",
                        isCurrent && "border-[#0B2545] bg-[#0B2545] text-white",
                        !isComplete && !isCurrent && "border-gray-200 bg-white text-gray-400"
                      )}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : step.id}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold leading-tight px-0.5",
                        isCurrent ? "text-[#0B2545]" : isComplete ? "text-gray-700" : "text-gray-400"
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Mobile compact stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.key}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-[#FF6A3D]" : "bg-gray-200"
              )}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-[#0B2545]">{WIZARD_STEPS[currentStep]?.title}</p>
      </div>
    </div>
  );
}
