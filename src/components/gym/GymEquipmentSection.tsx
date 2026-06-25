"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { parseGymEquipment } from "@/lib/gym-equipment";
import { EquipmentCard } from "@/components/gym/EquipmentCard";

const DEFAULT_VISIBLE_COUNT = 4;

interface GymEquipmentSectionProps {
  equipmentRaw: string | null;
  className?: string;
}

export function GymEquipmentSection({ equipmentRaw, className }: GymEquipmentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const items = parseGymEquipment(equipmentRaw);
  if (items.length === 0) return null;

  const hasMore = items.length > DEFAULT_VISIBLE_COUNT;
  const visibleItems = expanded || !hasMore ? items : items.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <section className={className}>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#FF6A3D]" />
          Equipment & Gear
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visibleItems.map((item) => (
            <EquipmentCard key={item.id} name={item.name} imageUrl={item.imageUrl} />
          ))}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 text-sm font-semibold text-[#FF6A3D] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/30 rounded"
          >
            {expanded ? "Show less" : "View all equipments"}
          </button>
        )}
      </div>
    </section>
  );
}
