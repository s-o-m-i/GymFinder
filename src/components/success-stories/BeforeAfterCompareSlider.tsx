"use client";

import type { CSSProperties } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderCssVars,
  ReactCompareSliderHandle,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { cn } from "@/lib/utils";

interface BeforeAfterCompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  bottomBeforeLabel?: string;
  bottomAfterLabel?: string;
  className?: string;
}

const handleColor = "#0B2545";

export function BeforeAfterCompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  bottomBeforeLabel,
  bottomAfterLabel,
  className,
}: BeforeAfterCompareSliderProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)] select-none touch-none",
        className
      )}
    >
      <ReactCompareSlider
        className="h-full w-full"
        defaultPosition={50}
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt="Before transformation"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt="After transformation"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        }
        handle={
          <ReactCompareSliderHandle
            style={
              { [ReactCompareSliderCssVars.handleColor]: handleColor } as CSSProperties
            }
            buttonStyle={{
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              background: "rgba(255, 255, 255, 0.28)",
              border: "2px solid rgba(255, 255, 255, 0.75)",
              color: handleColor,
              width: 52,
              height: 52,
              borderRadius: 9999,
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
            }}
            linesStyle={{
              width: 3,
              background: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 0 12px rgba(0, 0, 0, 0.4)",
            }}
          />
        }
      />

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-md bg-emerald-400 px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#0B2545]">
        {afterLabel}
      </span>

      {(bottomBeforeLabel || bottomAfterLabel) && (
        <>
          {bottomBeforeLabel && (
            <span className="pointer-events-none absolute bottom-4 left-4 z-10 text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-xl">
              {bottomBeforeLabel}
            </span>
          )}
          {bottomAfterLabel && (
            <span className="pointer-events-none absolute bottom-4 right-4 z-10 text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-xl">
              {bottomAfterLabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}
