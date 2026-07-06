"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLinkItem, NavSidebarSection } from "@/lib/nav-config";

interface NavbarSidebarProps {
  open: boolean;
  onClose: () => void;
  isHero: boolean;
  sections: NavSidebarSection[];
  primaryLinks?: NavLinkItem[];
  isPathActive: (href: string) => boolean;
  footer?: React.ReactNode;
}

export function NavbarSidebar({
  open,
  onClose,
  isHero,
  sections,
  primaryLinks,
  isPathActive,
  footer,
}: NavbarSidebarProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const linkClass = (active: boolean) =>
    cn(
      "block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
      isHero
        ? active
          ? "bg-white/15 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
        : active
          ? "bg-orange-50 text-[#FF6A3D]"
          : "text-[var(--text)] hover:bg-[var(--bg)]"
    );

  const sectionTitleClass = cn(
    "px-3.5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.14em]",
    isHero ? "text-white/45" : "text-[var(--text-muted)]"
  );

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col shadow-2xl",
          isHero ? "bg-[#0B2545] text-white" : "border-l border-[var(--border)] bg-[var(--card)]"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between border-b px-5 py-4",
            isHero ? "border-white/10" : "border-[var(--border)]"
          )}
        >
          <span className="font-heading text-base font-bold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-lg p-2 transition-colors",
              isHero
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-[var(--text-muted)] hover:bg-[var(--bg)]"
            )}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {primaryLinks && primaryLinks.length > 0 && (
            <div className="mb-2">
              <p className={sectionTitleClass}>Discover</p>
              <ul className="space-y-0.5">
                {primaryLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={linkClass(isPathActive(item.href))}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sections.map((section) => (
            <div key={section.title} className="mb-2">
              <p className={sectionTitleClass}>{section.title}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={linkClass(isPathActive(item.href))}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {footer && (
          <div
            className={cn(
              "shrink-0 space-y-2 border-t p-4",
              isHero ? "border-white/10" : "border-[var(--border)]"
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}
