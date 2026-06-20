import { Dumbbell } from "lucide-react";
import { parseGymEquipment } from "@/lib/gym-equipment";

interface GymEquipmentSectionProps {
  equipmentRaw: string | null;
  className?: string;
}

export function GymEquipmentSection({ equipmentRaw, className }: GymEquipmentSectionProps) {
  const items = parseGymEquipment(equipmentRaw);
  if (items.length === 0) return null;

  return (
    <section className={className}>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-[#FF6A3D]" />
          Equipment & Gear
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)]"
            >
              <Dumbbell className="w-3.5 h-3.5 text-[#FF6A3D] shrink-0" />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
