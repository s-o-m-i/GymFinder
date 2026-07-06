import { InteractivePakistanMap } from "@/components/home/map/InteractivePakistanMap";
import { getPakistanMapCityStats } from "@/services/home/home-map.service";
import { prisma } from "@/lib/prisma";

async function getTotalApprovedGyms(): Promise<number> {
  try {
    return await prisma.gym.count({ where: { listingStatus: "approved" } });
  } catch {
    return 0;
  }
}

export async function MapPreviewSection() {
  const [cities, totalGyms] = await Promise.all([
    getPakistanMapCityStats(),
    getTotalApprovedGyms(),
  ]);

  return <InteractivePakistanMap cities={cities} totalGyms={totalGyms} />;
}
