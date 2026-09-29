export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers, PlusCircle } from "lucide-react";
import { getOwnerSession } from "@/lib/owner-auth";
import { prisma } from "@/lib/prisma";
import { splitLinkedTags } from "@/lib/gym-tags";
import { OwnerGymCommonSettingsForm } from "@/components/gym-branch/OwnerGymCommonSettingsForm";

export default async function OwnerCommonSettingsPage() {
  const session = await getOwnerSession();
  if (!session) redirect("/owner/login");

  const [gym, disciplines, amenities] = await Promise.all([
    prisma.gym.findUnique({
      where: { ownerId: session.ownerId },
      include: {
        disciplines: { include: { discipline: true } },
        amenities: { include: { amenity: true } },
      },
    }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-6 h-6 text-[#FF6A3D]" />
          <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
            Common Settings
          </h1>
        </div>
        <p className="text-[var(--text-muted)] text-sm">
          Set hours, amenities, and disciplines once. Every branch inherits them
          unless that branch overrides them.
        </p>
      </div>

      {!gym ? (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
            Add your listing first
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Create a gym listing before setting brand-wide defaults.
          </p>
          <Link
            href="/owner/gym"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6A3D] text-white text-sm font-semibold rounded-xl hover:bg-[#e85528] transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Listing
          </Link>
        </div>
      ) : (
        <OwnerGymCommonSettingsForm
          gym={gym}
          disciplines={disciplines}
          amenities={amenities}
          disciplineTags={splitLinkedTags(
            gym.disciplines.map((item) => ({
              id: item.disciplineId,
              name: item.discipline.name,
            })),
            disciplines
          )}
          amenityTags={splitLinkedTags(
            gym.amenities.map((item) => ({
              id: item.amenityId,
              name: item.amenity.name,
            })),
            amenities
          )}
        />
      )}
    </div>
  );
}
