"use client";

import { useEffect, useState } from "react";

const ARTICLE_ID = "blog-article";

export function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(ARTICLE_ID);
    if (!article) return;

    function updateProgress() {
      const rect = article!.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article!.offsetHeight;
      const viewportHeight = window.innerHeight;

      const start = articleTop;
      const end = articleTop + articleHeight - viewportHeight * 0.25;
      const scrollable = end - start;

      if (scrollable <= 0) {
        setProgress(window.scrollY >= start ? 100 : 0);
        return;
      }

      const scrolled = window.scrollY - start;
      const next = Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
      setProgress(next);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-[var(--border)]/80"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FF6A3D] to-[#e85528] shadow-[0_0_8px_rgba(255,106,61,0.45)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
