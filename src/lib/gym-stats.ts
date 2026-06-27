import { parseGymEquipment } from "@/lib/gym-equipment";

export interface GymProfileStat {
  key: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export interface BuildGymProfileStatsInput {
  createdAt: Date;
  establishedYear?: number | null;
  memberCount?: number | null;
  equipmentRaw?: string | null;
  staffCount: number;
  rating?: number | null;
}

function formatRoundedCount(count: number): string {
  if (count >= 1000) {
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded.toLocaleString()}+`;
  }
  if (count >= 100) {
    return `${Math.floor(count / 50) * 50}+`;
  }
  if (count >= 10) {
    return `${Math.floor(count / 10) * 10}+`;
  }
  return String(count);
}

export function buildGymProfileStats(input: BuildGymProfileStatsInput): GymProfileStat[] {
  const stats: GymProfileStat[] = [];

  const year = input.establishedYear ?? new Date(input.createdAt).getFullYear();
  stats.push({
    key: "established",
    label: "Established",
    value: String(year),
  });

  if (input.memberCount != null && input.memberCount > 0) {
    stats.push({
      key: "members",
      label: "Members",
      value: formatRoundedCount(input.memberCount),
    });
  }

  if (input.staffCount > 0) {
    stats.push({
      key: "trainers",
      label: "Trainers",
      value: String(input.staffCount),
    });
  }

  const machineCount = parseGymEquipment(input.equipmentRaw).length;
  if (machineCount > 0) {
    stats.push({
      key: "machines",
      label: "Machines",
      value: String(machineCount),
    });
  }

  if (input.rating != null && input.rating > 0) {
    stats.push({
      key: "rating",
      label: "Rating",
      value: input.rating.toFixed(1),
      highlight: true,
    });
  }

  return stats;
}
