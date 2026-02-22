/**
 * Sample farmer data and original CDN URLs for profile pic, PAN, Aadhaar.
 * Keep in sync with khetibuddy-be/scripts/generate-farmers-csv.ts for consistency.
 */

export const SAMPLE_PROFILE_PIC_URLS = [
  "https://5w3tc3tne6.ucarecd.net/a69812bc-7b3a-4619-a37b-580735bfc987/-/preview/260x280/",
  "https://5w3tc3tne6.ucarecd.net/cf73c3a5-4c37-44bf-bea7-fb4ecadc8234/-/preview/900x500/",
] as const;

export const SAMPLE_PAN_URL =
  "https://5w3tc3tne6.ucarecd.net/c7d13f28-665b-48b3-8d46-5e244d7a9bf4/11.webp";

export const SAMPLE_AADHAAR_URL =
  "https://5w3tc3tne6.ucarecd.net/dea27951-0ec3-46ea-8ee2-b45ce6cbb64f/pancard1.jpg";

const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

function randomCode(): string {
  const n = 5000 + Math.floor(Math.random() * 5000);
  return `F${n}`;
}

function randomDate(startYear: number, endYear: number): string {
  const y = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const FIRST_NAMES = [
  "Raghavendra", "Shivappa", "Basavaraj", "Manjunath", "Mallikarjun",
  "Nagaraj", "Siddappa", "Hanumanth", "Prakash", "Mahesh",
  "Lakshmi", "Savita", "Geetha", "Annapurna", "Pavitra",
];

const LAST_NAMES = [
  "Gowda", "Patil", "Shetty", "Naik", "Hegde",
  "Reddy", "Kulkarni", "Bhat", "Poojari", "Desai",
];

const VILLAGES = [
  "Devgaon", "Vadgaon", "Shirpur", "Nashik", "Jalgaon",
  "Sangamner", "Rahuri", "Kopargaon", "Shirdi", "Yeola",
];

const TALUKAS = [
  "Parner", "Shrirampur", "Nevasa", "Rahata", "Sangamner",
  "Akole", "Kopargaon", "Niphad", "Malegaon", "Yeola",
];

const DISTRICTS = [
  "Ahmadnagar", "Pune", "Nashik", "Jalgaon", "Dhule",
  "Beed", "Aurangabad", "Solapur", "Satara", "Kolhapur",
];

const PINCODES = [
  "414302", "411014", "422101", "425001", "424001",
  "431122", "431001", "413001", "415001", "416001",
];

const LANDMARKS = [
  "Near Panchayat Office", "Opposite Primary School", "Behind Temple",
  "Main Road", "Post Office Road", "Near Mandir",
];

const EDUCATION = [
  "Illiterate", "Primary", "8th Pass", "10th Pass", "12th Pass",
  "Graduate", "Post Graduate", "ITI", "Diploma",
];

const FPC = ["FPC001", "FPC002", "FPC003", "FPC008", "FPC010"];
const SHG = ["SHG-A", "SHG-B", "SHG-C", "SHG-J"];
const CASTE = ["General", "OBC", "SC", "ST"];
const SOCIAL_CATEGORY = ["General", "OBC", "SC", "ST"];

export interface SampleFarmerForm {
  farmer_code: string;
  name: string;
  gender: "MALE" | "FEMALE" | null;
  dob: string;
  education: string;
  kyc_status: "PENDING" | "VERIFIED" | "REJECTED";
  is_activated: boolean;
  profile_pic_url: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  landmark: string;
  fpc: string;
  shg: string;
  caste: string;
  social_category: string;
  ration_card: boolean;
  pan_url: string;
  aadhaar_url: string;
}

export function getSampleFarmerData(): SampleFarmerForm {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const suffix = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return {
    farmer_code: randomCode(),
    name: `${first} ${last}${suffix}`,
    gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
    dob: randomDate(1960, 2000),
    education: pick(EDUCATION),
    kyc_status: "PENDING",
    is_activated: false,
    profile_pic_url: pick(SAMPLE_PROFILE_PIC_URLS),
    village: pick(VILLAGES),
    taluka: pick(TALUKAS),
    district: pick(DISTRICTS),
    state: "Maharashtra",
    pincode: pick(PINCODES),
    landmark: pick(LANDMARKS),
    fpc: pick(FPC),
    shg: pick(SHG),
    caste: pick(CASTE),
    social_category: pick(SOCIAL_CATEGORY),
    ration_card: Math.random() > 0.5,
    pan_url: SAMPLE_PAN_URL,
    aadhaar_url: SAMPLE_AADHAAR_URL,
  };
}
