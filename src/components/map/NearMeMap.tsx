"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { GymCardDataWithDistance } from "@/types";
import { formatDistance } from "@/lib/getDistance";
import { getGymBranchPath } from "@/lib/gym-branch-rules";

// User location: pulsing blue dot
function makeUserIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:24px;height:24px">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(59,130,246,0.25);
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#3b82f6;border:2px solid white;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
        "></div>
      </div>
      <style>
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Gym pin: orange tear-drop
function makeGymIcon(featured: boolean) {
  const bg = featured ? "#FF6A3D" : "#0B2545";
  const emoji = "🏋";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${bg};border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
      ">
        <span style="transform:rotate(45deg);font-size:14px;line-height:1">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

function fitMapToMarkers(
  map: L.Map,
  userLat: number,
  userLng: number,
  gyms: GymCardDataWithDistance[]
) {
  const points: [number, number][] = [[userLat, userLng]];
  gyms.forEach((g) => {
    if (g.latitude != null && g.longitude != null) {
      points.push([g.latitude, g.longitude]);
    }
  });

  if (points.length === 1) {
    map.setView(points[0], 14);
    return;
  }

  map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
}

// Recalculate map size after mount / toggle / container resize
function MapController({
  userLat,
  userLng,
  gyms,
}: {
  userLat: number;
  userLng: number;
  gyms: GymCardDataWithDistance[];
}) {
  const map = useMap();

  useEffect(() => {
    const refresh = () => {
      map.invalidateSize({ animate: false });
      fitMapToMarkers(map, userLat, userLng, gyms);
    };

    refresh();
    const t1 = window.setTimeout(refresh, 100);
    const t2 = window.setTimeout(refresh, 400);

    const container = map.getContainer();
    const observer = new ResizeObserver(() => refresh());
    observer.observe(container);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
    };
  }, [map, userLat, userLng, gyms]);

  return null;
}

// Enable trackpad / mouse-wheel zoom while hovering the map (keeps page scroll elsewhere)
function EnableScrollWheelZoomOnHover() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();

    const container = map.getContainer();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();

    container.addEventListener("mouseenter", enable);
    container.addEventListener("mouseleave", disable);
    container.addEventListener("touchstart", enable, { passive: true });

    return () => {
      container.removeEventListener("mouseenter", enable);
      container.removeEventListener("mouseleave", disable);
      container.removeEventListener("touchstart", enable);
    };
  }, [map]);

  return null;
}

interface NearMeMapProps {
  userLat: number;
  userLng: number;
  gyms: GymCardDataWithDistance[];
}

export default function NearMeMap({ userLat, userLng, gyms }: NearMeMapProps) {
  const userIcon = makeUserIcon();

  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={13}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
      zoomControl
      scrollWheelZoom
      touchZoom
      doubleClickZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <MapController userLat={userLat} userLng={userLng} gyms={gyms} />
      <EnableScrollWheelZoomOnHover />

      <Marker position={[userLat, userLng]} icon={userIcon}>
        <Popup>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 120 }}>
            <strong style={{ color: "#3b82f6" }}>📍 Your Location</strong>
            <div
              style={{
                color: "#6b7280",
                marginTop: 2,
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              {userLat.toFixed(5)}°N, {userLng.toFixed(5)}°E
            </div>
          </div>
        </Popup>
      </Marker>

      {gyms.map((gym) => {
        if (gym.latitude == null || gym.longitude == null) return null;
        const gymIcon = makeGymIcon(gym.featured);
        return (
          <Marker
            key={gym.branchId ?? gym.id}
            position={[gym.latitude, gym.longitude]}
            icon={gymIcon}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, minWidth: 160 }}>
                <strong style={{ color: "#0B2545", fontSize: 14 }}>{gym.branchName ?? gym.name}</strong>
                <div style={{ color: "#6b7280", marginTop: 2 }}>
                  {gym.area}, {gym.city}
                </div>
                <div style={{ marginTop: 4, display: "flex", gap: 6, alignItems: "center" }}>
                  <span
                    style={{
                      background: "#0B2545",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {formatDistance(gym.distanceKm)} away
                  </span>
                  <span style={{ color: "#6b7280", fontSize: 11 }}>
                    PKR {gym.priceMin.toLocaleString()}–{gym.priceMax.toLocaleString()}
                  </span>
                </div>
                <a
                  href={gym.listingSlug ? getGymBranchPath(gym.listingSlug) : `/gyms/${gym.slug}`}
                  style={{
                    display: "block",
                    marginTop: 8,
                    background: "#FF6A3D",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 8,
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
