"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const ABOUT_CHAR_LIMIT = 320;

interface GymAboutTextProps {
  text: string;
}

export function GymAboutText({ text }: GymAboutTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > ABOUT_CHAR_LIMIT;

  return (
    <div>
      <p
        className={cn(
          "text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words max-w-full",
          !expanded && isLong && "line-clamp-5"
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-semibold text-[#FF6A3D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/30 rounded"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}
