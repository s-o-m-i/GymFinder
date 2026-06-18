import { NextRequest, NextResponse } from "next/server";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
  lat: string;
  lon: string;
}

function buildAddressLabel(addr: NominatimAddress): { area: string; city: string; display: string } {
  // Best local area name (most specific first)
  const area =
    addr.neighbourhood ||
    addr.quarter ||
    addr.suburb ||
    addr.village ||
    addr.road ||
    "";

  const city =
    addr.city ||
    addr.town ||
    addr.county ||
    addr.state_district ||
    addr.state ||
    "Unknown";

  // Build a display string like "F-7/2, Islamabad" or "Shalley Valley, Rawalpindi"
  const display = area && area !== city ? `${area}, ${city}` : city;

  return { area, city, display };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en&addressdetails=1&zoom=18`;

    const res = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent — using app name + contact
        "User-Agent": "GymFinderPK/1.0 (gymfinderpk@gmail.com)",
        "Accept-Language": "en",
      },
      next: { revalidate: 300 }, // cache 5 min per coordinate
    });

    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);

    const data: NominatimResponse = await res.json();
    const { area, city, display } = buildAddressLabel(data.address);

    return NextResponse.json({
      display,
      area,
      city,
      fullAddress: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      raw: data.address,
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    // Fallback — return raw coords
    return NextResponse.json({
      display:     `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lng).toFixed(4)}°E`,
      area:        "",
      city:        "Your location",
      fullAddress: "",
      lat:         parseFloat(lat),
      lng:         parseFloat(lng),
      raw:         {},
    });
  }
}
