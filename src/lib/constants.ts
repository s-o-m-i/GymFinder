export const CITIES = ["Rawalpindi", "Islamabad"] as const;
export type City = (typeof CITIES)[number];

export const GYM_TYPES = [
  { value: "gym",          label: "Gym" },
  { value: "boxing",       label: "Boxing" },
  { value: "mma",          label: "MMA" },
  { value: "muay_thai",    label: "Muay Thai" },
  { value: "kickboxing",   label: "Kickboxing" },
  { value: "martial_arts", label: "Martial Arts" },
] as const;

export const LADIES_STATUS_OPTIONS = [
  { value: "mixed", label: "Mixed" },
  { value: "ladies_only", label: "Ladies Only" },
  { value: "ladies_timings", label: "Ladies Timings" },
  { value: "men_only", label: "Men Only" },
] as const;

export const SIZE_CATEGORIES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

export const RAWALPINDI_AREAS = [
  "Saddar",
  "Bahria Town",
  "DHA Phase 1",
  "DHA Phase 2",
  "Westridge",
  "Satellite Town",
  "Chaklala",
  "Gulraiz",
  "Askari",
  "Lalazar",
  "Pindora",
  "Dhok Kala Khan",
  "Committee Chowk",
  "Raja Bazar",
  "Murree Road",
];

export const ISLAMABAD_AREAS = [
  "F-6",
  "F-7",
  "F-8",
  "F-10",
  "F-11",
  "G-9",
  "G-10",
  "G-11",
  "G-13",
  "I-8",
  "I-10",
  "Blue Area",
  "Bahria Town",
  "DHA Phase 1",
  "DHA Phase 2",
  "Bani Gala",
  "Margalla",
  "Srinagar Highway",
  "PWD",
  "Gulberg",
];

export const ALL_AREAS = [
  ...RAWALPINDI_AREAS.map((a) => ({ area: a, city: "Rawalpindi" })),
  ...ISLAMABAD_AREAS.map((a) => ({ area: a, city: "Islamabad" })),
];

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi, I found your gym on GymFinder PK. I want more details about membership.";

export const SITE_NAME = "GymFinder PK";
export const SITE_DESCRIPTION =
  "Discover the best gyms and fighting clubs in Rawalpindi & Islamabad. Compare prices, facilities, and contact directly on WhatsApp.";

export const PRICE_RANGE = { min: 0, max: 15000 };
