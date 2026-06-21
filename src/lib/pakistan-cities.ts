/** Major cities across Pakistan — used in filters, forms, and SEO routes. */
export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Gujrat",
  "Jhelum",
  "Mardan",
  "Mingora",
  "Mirpur",
  "Muzaffarabad",
  "Gwadar",
  "Turbat",
  "Dera Ghazi Khan",
  "Sahiwal",
  "Okara",
  "Kasur",
  "Rahim Yar Khan",
  "Wah Cantonment",
  "Taxila",
  "Murree",
  "Haripur",
  "Mansehra",
  "Kohat",
  "Bannu",
  "Nawabshah",
  "Jacobabad",
  "Khuzdar",
  "Gilgit",
  "Skardu",
  "Chitral",
  "Attock",
  "Chakwal",
  "Kharian",
  "Dera Ismail Khan",
  "Nowshera",
  "Hafizabad",
  "Kamoke",
  "Muzaffargarh",
  "Gojra",
  "Bahawalnagar",
  "Pakpattan",
  "Jhang",
  "Toba Tek Singh",
  "Hasan Abdal",
  "Charsadda",
  "Swat",
  "Khanpur",
  "Kot Addu",
] as const;

export type PakistanCity = (typeof PAKISTAN_CITIES)[number];

export function slugifyCity(city: string): string {
  return city
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export const CITY_SLUG_TO_NAME: Record<string, PakistanCity> = Object.fromEntries(
  PAKISTAN_CITIES.map((city) => [slugifyCity(city), city])
) as Record<string, PakistanCity>;

export function citySlugToName(slug: string): PakistanCity | null {
  return CITY_SLUG_TO_NAME[slug.toLowerCase()] ?? null;
}

export function cityNameToSlug(city: string): string | null {
  const slug = slugifyCity(city);
  return CITY_SLUG_TO_NAME[slug] ? slug : null;
}

export function isKnownCity(city: string): city is PakistanCity {
  return cityNameToSlug(city) !== null;
}

export function getCitySeoCopy(city: string) {
  return {
    title: `Best Gyms & Fighting Clubs in ${city}`,
    description: `Discover gyms, boxing clubs, MMA academies, and martial arts centers in ${city}, Pakistan. Compare monthly fees, facilities, and contact directly on WhatsApp.`,
    keywords: [
      `gyms in ${city}`,
      `boxing clubs ${city}`,
      `MMA gym ${city}`,
      `fighting clubs ${city}`,
      `fitness centers ${city}`,
    ],
  };
}

export function getTrainerCitySeoCopy(city: string) {
  return {
    title: `Personal Trainers & Coaches in ${city}`,
    description: `Find certified boxing, MMA, and fitness trainers in ${city}, Pakistan. Compare experience, rates, and contact coaches directly on WhatsApp.`,
    keywords: [
      `personal trainer ${city}`,
      `boxing coach ${city}`,
      `MMA trainer ${city}`,
      `fitness coach ${city}`,
    ],
  };
}

export function getEventCitySeoCopy(city: string) {
  return {
    title: `Fitness & Fighting Events in ${city}`,
    description: `Discover upcoming and past boxing, MMA, fitness, and martial arts events in ${city}, Pakistan. Competitions, seminars, and gym-hosted events.`,
  };
}
