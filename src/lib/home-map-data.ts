import { cityNameToSlug } from "@/lib/constants";
import { mapCoordToPercent } from "@/lib/pakistan-map-provinces";

export type PakistanMapCityId =
  | "lahore"
  | "karachi"
  | "islamabad"
  | "rawalpindi"
  | "peshawar"
  | "quetta";

/** Map coordinates aligned to @svg-maps/pakistan.districts viewBox */
export type PakistanMapCityConfig = {
  id: PakistanMapCityId;
  name: string;
  mapX: number;
  mapY: number;
  x: number;
  y: number;
};

const CITY_COORDS: Omit<PakistanMapCityConfig, "x" | "y">[] = [
  { id: "peshawar", name: "Peshawar", mapX: 1090, mapY: 406 },
  { id: "islamabad", name: "Islamabad", mapX: 1273, mapY: 420 },
  { id: "rawalpindi", name: "Rawalpindi", mapX: 1278, mapY: 390 },
  { id: "lahore", name: "Lahore", mapX: 1346, mapY: 691 },
  { id: "quetta", name: "Quetta", mapX: 664, mapY: 809 },
  { id: "karachi", name: "Karachi", mapX: 672, mapY: 1403 },
];

export const PAKISTAN_MAP_CITIES: PakistanMapCityConfig[] = CITY_COORDS.map((city) => {
  const { left, top } = mapCoordToPercent(city.mapX, city.mapY);
  return { ...city, x: left, y: top };
});

export function getPakistanMapCityHref(cityName: string): string {
  const slug = cityNameToSlug(cityName);
  return slug ? `/gyms/${slug}` : `/gyms?city=${encodeURIComponent(cityName)}`;
}

export type PakistanMapCityStat = PakistanMapCityConfig & {
  gymCount: number;
  href: string;
};
