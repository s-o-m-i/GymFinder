"use client";

import { cn } from "@/lib/utils";

interface TrainerProfileProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completionPercentage: number;
}

export function TrainerProfileProgressBar({
  currentStep,
  totalSteps,
  completionPercentage,
}: TrainerProfileProgressBarProps) {
  return (
    <div className="mb-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-gray-500">
          Profile{" "}
          <span className="font-semibold text-[#0B2545]">{completionPercentage}%</span> complete
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Overall completion</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              completionPercentage >= 80 ? "bg-[#FF6A3D]" : "bg-[#FF6A3D]/70"
            )}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
