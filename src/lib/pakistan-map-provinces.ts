export const PAKISTAN_MAP_VIEWBOX = {
  minX: 27,
  minY: 28,
  width: 1628,
  height: 1544,
} as const;

export type PakistanMapProvinceId =
  | "balochistan"
  | "sindh"
  | "punjab"
  | "kpk"
  | "gilgit"
  | "ajk"
  | "islamabad";

export const PAKISTAN_PROVINCE_COLORS: Record<PakistanMapProvinceId, string> = {
  balochistan: "#3f7a48",
  sindh: "#d4ad2a",
  punjab: "#6cab58",
  kpk: "#2f9494",
  gilgit: "#5fa862",
  ajk: "#2f6840",
  islamabad: "#4a8ec2",
};

const BALOCHISTAN = new Set([
  "awaran",
  "barkhan",
  "bolan",
  "chaghai",
  "dera-bugti",
  "gwadar",
  "haranai",
  "jafarabad",
  "jhal-magsi",
  "kalat",
  "kech",
  "kharan",
  "khuzdar",
  "killa-abdullah",
  "killa-saifullah",
  "kohlu",
  "lasbela",
  "loralai",
  "mastung",
  "musakhel",
  "naseerabad",
  "nushki",
  "panjgur",
  "pishin",
  "quetta",
  "sheerani",
  "sibi",
  "washuk",
  "ziarat",
  "zhob",
]);

const SINDH = new Set([
  "badin",
  "dadu",
  "ghotki",
  "hyderabad",
  "jacobabad",
  "jamshoro",
  "karachi",
  "kashmore",
  "khairpur",
  "larkana",
  "matiari",
  "mirpur-khas",
  "naushahro-firoze",
  "nawabshah",
  "qambar-shahdatkot",
  "sanghar",
  "shikarpur",
  "sukkur",
  "tando-allahyar",
  "tando-muhammad-khan",
  "tharparkar",
  "thatta",
  "umerkot",
]);

const PUNJAB = new Set([
  "attock",
  "bahawalnagar",
  "bahawalpur",
  "bhakkar",
  "chakwal",
  "chiniot",
  "dera-ghazi-khan",
  "faisalabad",
  "gujrat",
  "gujranwala",
  "hafizabad",
  "jhang",
  "jhelum",
  "kasur",
  "khanewal",
  "khushab",
  "lahore",
  "layyah",
  "lodhran",
  "mandi-bahauddin",
  "mianwali",
  "multan",
  "muzaffargarh",
  "nankana-sahab",
  "narowal",
  "okara",
  "pakpattan",
  "rahimyar-khan",
  "rajanpur",
  "rawalpindi",
  "sahiwal",
  "sargodha",
  "shaikhupura",
  "sialkot",
  "toba-tek-singh",
  "vehari",
]);

const KPK = new Set([
  "abbottabad",
  "bajaur",
  "bannu",
  "bannu-subdivision",
  "battagram",
  "buner",
  "charsadda",
  "chitral",
  "d-i-khan-subdivision",
  "dera-ismail-khan",
  "hangu",
  "haripur",
  "karak",
  "khyber",
  "kohat",
  "kohat-subdivision",
  "kohistan",
  "kurram",
  "lakki-marwat",
  "lakki-subdivision",
  "lower-dir",
  "malakand",
  "mansehra",
  "mardan",
  "mohmand",
  "north-waziristan",
  "nowshera",
  "orakzai",
  "peshawar",
  "peshawar-subdivision",
  "shangla",
  "south-waziristan",
  "swabi",
  "swat",
  "tank",
  "tank-subdivision",
  "upper-dir",
]);

const GILGIT = new Set([
  "astore",
  "diamer",
  "ghanhce",
  "ghizer",
  "gilgit",
  "hunza-nagar",
  "skardu",
]);

const AJK = new Set([
  "bagh",
  "bhimber",
  "hattian",
  "haveli",
  "kotli",
  "mirpur",
  "muzaffarabad",
  "neelum",
  "poonch",
  "sudhnati",
]);

export function getDistrictProvince(districtId: string): PakistanMapProvinceId {
  if (districtId === "islamabad") return "islamabad";
  if (BALOCHISTAN.has(districtId)) return "balochistan";
  if (SINDH.has(districtId)) return "sindh";
  if (PUNJAB.has(districtId)) return "punjab";
  if (KPK.has(districtId)) return "kpk";
  if (GILGIT.has(districtId)) return "gilgit";
  if (AJK.has(districtId)) return "ajk";
  return "punjab";
}

export function mapCoordToPercent(x: number, y: number) {
  const { minX, minY, width, height } = PAKISTAN_MAP_VIEWBOX;
  return {
    left: ((x - minX) / width) * 100,
    top: ((y - minY) / height) * 100,
  };
}
