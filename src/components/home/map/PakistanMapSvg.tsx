"use client";

import pakistanDistricts from "@svg-maps/pakistan.districts";
import {
  getDistrictProvince,
  PAKISTAN_MAP_VIEWBOX,
  PAKISTAN_PROVINCE_COLORS,
} from "@/lib/pakistan-map-provinces";

type DistrictLocation = {
  id: string;
  name: string;
  path: string;
};

export function PakistanMapSvg({ className }: { className?: string }) {
  const { minX, minY, width, height } = PAKISTAN_MAP_VIEWBOX;
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="pk-country-glow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FF6A3D" floodOpacity="0.12" />
        </filter>
      </defs>

      <g data-pakistan-outline filter="url(#pk-country-glow)">
        {(pakistanDistricts.locations as DistrictLocation[]).map((location) => {
          const province = getDistrictProvince(location.id);
          const fill = PAKISTAN_PROVINCE_COLORS[province];

          return (
            <path
              key={location.id}
              d={location.path}
              fill={fill}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth={0.75}
              className="transition-[fill,opacity] duration-300 hover:brightness-110"
            />
          );
        })}
      </g>
    </svg>
  );
}
