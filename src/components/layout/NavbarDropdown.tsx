"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/lib/nav-config";

const CLOSE_DELAY_MS = 180;

interface NavbarDropdownProps {
  label: string;
  items: NavLinkItem[];
  isHero?: boolean;
  isActive?: boolean;
  align?: "left" | "right";
  onNavigate?: () => void;
  variant?: "nav" | "cta";
}

export function NavbarDropdown({
  label,
  items,
  isHero = false,
  isActive = false,
  align = "left",
  onNavigate,
  variant = "nav",
}: NavbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openMenu() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const triggerClass =
    variant === "cta"
      ? cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors xl:px-4",
          isHero
            ? "border border-white/30 text-white hover:bg-white/10"
            : "border border-[#0B2545] text-[#0B2545] hover:bg-[#0B2545] hover:text-white"
        )
      : cn(
          "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3",
          isHero
            ? isActive || open
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
            : isActive || open
              ? "bg-orange-50 text-[#FF6A3D]"
              : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
        );

  const panelClass = cn(
    "min-w-[15rem] overflow-hidden rounded-xl border shadow-lg",
    isHero
      ? "border-white/15 bg-[#0B2545]/95 backdrop-blur-xl"
      : "border-[var(--border)] bg-[var(--card)]"
  );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={triggerClass}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full z-50 pt-2",
            align === "right" ? "right-0" : "left-0"
          )}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          <div id={menuId} role="menu" className={panelClass}>
            <ul className="py-1.5">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    role="menuitem"
                    onClick={() => {
                      clearCloseTimer();
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className={cn(
                      "flex flex-col gap-0.5 px-3.5 py-2.5 transition-colors",
                      isHero
                        ? "text-white/85 hover:bg-white/10 hover:text-white"
                        : "text-[var(--text)] hover:bg-[var(--bg)]"
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {item.emoji ? `${item.emoji} ` : ""}
                      {item.label}
                    </span>
                    {item.description && (
                      <span
                        className={cn(
                          "text-xs",
                          isHero ? "text-white/55" : "text-[var(--text-muted)]"
                        )}
                      >
                        {item.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

interface NavbarMobileSectionProps {
  title: string;
  items: NavLinkItem[];
  isHero?: boolean;
  onNavigate?: () => void;
}

export function NavbarMobileSection({
  title,
  items,
  isHero,
  onNavigate,
}: NavbarMobileSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
          isHero ? "text-white/85 hover:bg-white/10" : "text-[var(--text)] hover:bg-[var(--bg)]"
        )}
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-0.5 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isHero
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]"
              )}
            >
              {item.emoji ? `${item.emoji} ` : ""}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
