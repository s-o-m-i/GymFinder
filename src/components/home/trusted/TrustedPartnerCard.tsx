"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TrustedBrandVariant, TrustedPartner } from "@/lib/trusted-partners-data";
import { cn } from "@/lib/utils";

function GoldsGymLogo() {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="font-serif text-[1.35rem] italic text-[#d4af37]">GOLD&apos;S</span>
      <span className="mt-0.5 text-[0.62rem] font-bold tracking-[0.28em] text-[#d4af37]">GYM</span>
    </div>
  );
}

function ShapesLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#FF6A3D] to-[#ffb347] text-lg font-black text-white">
        S
      </span>
      <div className="text-left leading-tight">
        <p className="text-sm font-bold text-white">Shapes</p>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/55">
          Health Club
        </p>
      </div>
    </div>
  );
}

function IronBoxLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#ff4d4d]/40 bg-[#ff4d4d]/10 text-sm font-black text-[#ff4d4d]">
        B
      </span>
      <div className="text-left leading-tight">
        <p className="text-[0.68rem] font-black tracking-[0.08em] text-white">IRON BOX</p>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/55">
          FITNESS
        </p>
      </div>
    </div>
  );
}

function UfcGymLogo() {
  return (
    <div className="text-center leading-none">
      <p className="text-xl font-black tracking-[0.08em] text-[#d71920]">UFC</p>
      <p className="mt-0.5 text-[0.62rem] font-bold tracking-[0.28em] text-white/85">GYM</p>
    </div>
  );
}

function FlexFitnessLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6A3D] text-sm font-black text-white">
        F
      </span>
      <div className="text-left leading-tight">
        <p className="text-sm font-bold lowercase text-white">
          flex <span className="font-semibold text-white/70">fitness</span>
        </p>
      </div>
    </div>
  );
}

function StructureLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-[#8BC34A] to-[#cddc39] text-lg font-black text-[#1b2a12]">
        S
      </span>
      <div className="text-left leading-tight">
        <p className="text-sm font-bold text-white">Structure</p>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/55">
          Health Club
        </p>
      </div>
    </div>
  );
}

function PowerHouseLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 text-[#d4af37]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M12 3 4 9v12h6v-7h4v7h6V9l-8-6z" />
        </svg>
      </span>
      <div className="text-left leading-tight">
        <p className="text-[0.68rem] font-black tracking-[0.08em] text-[#d4af37]">POWER HOUSE</p>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/55">GYM</p>
      </div>
    </div>
  );
}

function GenericLogo({ name }: { name: string }) {
  return (
    <span className="max-w-[9rem] truncate text-center text-xs font-bold uppercase tracking-[0.16em] text-white/90">
      {name}
    </span>
  );
}

function BrandLogo({ partner }: { partner: TrustedPartner }) {
  if (partner.logo) {
    return (
      <Image
        src={partner.logo}
        alt=""
        width={132}
        height={40}
        loading="lazy"
        className="max-h-10 w-auto object-contain"
      />
    );
  }

  const variants: Record<TrustedBrandVariant, ReactNode> = {
    "golds-gym": <GoldsGymLogo />,
    shapes: <ShapesLogo />,
    "iron-box": <IronBoxLogo />,
    "ufc-gym": <UfcGymLogo />,
    "flex-fitness": <FlexFitnessLogo />,
    structure: <StructureLogo />,
    "power-house": <PowerHouseLogo />,
    generic: <GenericLogo name={partner.name} />,
  };

  return variants[partner.brandVariant] ?? variants.generic;
}

export function TrustedPartnerCard({ partner }: { partner: TrustedPartner }) {
  return (
    <Link
      href={partner.href}
      data-trusted-card
      aria-label={`${partner.name} partner profile`}
      className={cn(
        "trusted-partner-card group relative flex h-[88px] w-[168px] shrink-0 items-center justify-center rounded-2xl px-4",
        "border border-white/[0.08] bg-[#0a1628]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.28)]",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-[#FF6A3D]/45 hover:shadow-[0_16px_40px_rgba(255,106,61,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A14]"
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,61,0.12),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <BrandLogo partner={partner} />
    </Link>
  );
}
