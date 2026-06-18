export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { GymForm } from "@/components/admin/GymForm";

async function getData() {
  const [disciplines, amenities] = await Promise.all([
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { disciplines, amenities };
}

export default async function AddGymPage() {
  const { disciplines, amenities } = await getData();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">Add New Gym</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Fill in the details below to add a new gym listing.
        </p>
      </div>

      <GymForm
        disciplines={disciplines}
        amenities={amenities}
        mode="create"
      />
    </div>
  );
}
