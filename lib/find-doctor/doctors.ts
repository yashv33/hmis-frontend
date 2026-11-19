import type { Doctor, Hospital } from "./types";

/** Specialty → hospital department + conditions people search for. */
const SPECIALTY_INFO: Record<string, { department: string; conditions: string[] }> = {
  Cardiology: {
    department: "Heart & Vascular Institute",
    conditions: ["chest pain", "hypertension", "heart failure", "palpitations"],
  },
  Dermatology: {
    department: "Skin & Aesthetics",
    conditions: ["acne", "eczema", "psoriasis", "hair loss", "rash"],
  },
  Hematology: {
    department: "Blood Sciences",
    conditions: ["anaemia", "anemia", "clotting disorder", "thalassemia"],
  },
  Neurology: {
    department: "Neurosciences",
    conditions: ["migraine", "epilepsy", "stroke", "headache"],
  },
  Orthopaedics: {
    department: "Bone & Joint Centre",
    conditions: ["knee pain", "fracture", "back pain", "arthritis"],
  },
  Paediatrics: {
    department: "Women & Child Care",
    conditions: ["fever", "child vaccination", "growth", "cough"],
  },
  Ophthalmology: {
    department: "Eye Care",
    conditions: ["cataract", "glaucoma", "blurred vision", "dry eyes"],
  },
  "General Medicine": {
    department: "Internal Medicine",
    conditions: ["fever", "check-up", "diabetes", "blood pressure"],
  },
};

type Slot = [label: string, icon: "dot" | "calendar"];
type Row = {
  id: string;
  name: string;
  quals: string[];
  specialty: keyof typeof SPECIALTY_INFO;
  hospital: Hospital;
  years: number;
  languages: string[];
  photo?: string;
  slot?: Slot;
  listed?: boolean;
};

const E = "English";
const dot = (label: string): Slot => [label, "dot"];
const cal = (label: string): Slot => [label, "calendar"];

// Figma "G-01.01 - Find a Doctor" pages 1–4 (24 doctors, same order and text), then the two
// cardiologists that only show up in the Cardiology filter frames. Row order is the mock
// "Earliest available" order — the design lists doctors this way. The frames use a green dot for
// some slots and a calendar icon for others without a pattern, so the marker is part of the data.
const ROWS: Row[] = [
  // page 1
  { id: "rajesh-kumar", name: "Dr. Rajesh Kumar", quals: ["MBBS", "MD"], specialty: "Cardiology", hospital: "Bengaluru", years: 15, languages: [E, "Hindi", "Kannada"], photo: "rajesh-kumar", slot: dot("Today, 10:30 AM") },
  { id: "ananya-rao", name: "Dr. Ananya Rao", quals: ["MBBS", "MD"], specialty: "Dermatology", hospital: "Chennai", years: 9, languages: [E, "Tamil", "Telugu"], photo: "ananya-rao", slot: dot("Today, 04:00 PM") },
  { id: "vikram-shah", name: "Dr. Vikram Shah", quals: ["MBBS", "MD"], specialty: "Hematology", hospital: "Hyderabad", years: 12, languages: [E, "Hindi", "Gujarati"], photo: "vikram-shah" },
  { id: "priya-menon", name: "Dr. Priya Menon", quals: ["MBBS", "DM"], specialty: "Cardiology", hospital: "Bengaluru", years: 11, languages: [E, "Malayalam", "Hindi"], photo: "priya-menon", slot: dot("Today, 11:30 AM") },
  { id: "arjun-nair", name: "Dr. Arjun Nair", quals: ["MBBS", "MD"], specialty: "Dermatology", hospital: "Bengaluru", years: 7, languages: [E, "Malayalam"], photo: "arjun-nair", slot: cal("Tomorrow, 10:00 AM") },
  { id: "meera-iyer", name: "Dr. Meera Iyer", quals: ["MBBS", "MD"], specialty: "Hematology", hospital: "Chennai", years: 18, languages: [E, "Tamil"], photo: "meera-iyer", slot: cal("Sat, 07 Nov, 09:30 AM") },
  // page 2
  { id: "kavya-reddy", name: "Dr. Kavya Reddy", quals: ["MBBS", "MS"], specialty: "Orthopaedics", hospital: "Hyderabad", years: 10, languages: [E, "Telugu", "Hindi"], slot: dot("Today, 05:30 PM") },
  { id: "rohan-mehta", name: "Dr. Rohan Mehta", quals: ["MBBS", "MD"], specialty: "Neurology", hospital: "Bengaluru", years: 14, languages: [E, "Hindi", "Marathi"], slot: dot("Tomorrow, 09:00 AM") },
  { id: "fatima-sheikh", name: "Dr. Fatima Sheikh", quals: ["MBBS", "DCH"], specialty: "Paediatrics", hospital: "Hyderabad", years: 8, languages: [E, "Urdu", "Telugu"], slot: dot("Today, 06:00 PM") },
  { id: "suresh-babu", name: "Dr. Suresh Babu", quals: ["MBBS", "MS"], specialty: "Ophthalmology", hospital: "Chennai", years: 20, languages: [E, "Tamil"], slot: dot("Tomorrow, 11:00 AM") },
  { id: "neha-kapoor", name: "Dr. Neha Kapoor", quals: ["MBBS", "MD"], specialty: "General Medicine", hospital: "Bengaluru", years: 6, languages: [E, "Hindi"], slot: cal("Today, 04:30 PM") },
  { id: "anil-varghese", name: "Dr. Anil Varghese", quals: ["MBBS", "MS"], specialty: "Orthopaedics", hospital: "Chennai", years: 16, languages: [E, "Malayalam", "Tamil"], slot: cal("Fri, 06 Nov, 10:00 AM") },
  // page 3
  { id: "lakshmi-narayanan", name: "Dr. Lakshmi Narayanan", quals: ["MBBS", "MD"], specialty: "Hematology", hospital: "Chennai", years: 15, languages: [E, "Tamil"], slot: dot("Today, 03:00 PM") },
  { id: "imran-qureshi", name: "Dr. Imran Qureshi", quals: ["MBBS", "DM"], specialty: "Neurology", hospital: "Hyderabad", years: 12, languages: [E, "Urdu", "Hindi"], slot: dot("Tomorrow, 10:30 AM") },
  { id: "sneha-kulkarni", name: "Dr. Sneha Kulkarni", quals: ["MBBS", "MD"], specialty: "Dermatology", hospital: "Bengaluru", years: 5, languages: [E, "Kannada", "Marathi"], slot: dot("Today, 05:00 PM") },
  { id: "vivek-joshi", name: "Dr. Vivek Joshi", quals: ["MBBS", "MS"], specialty: "Orthopaedics", hospital: "Bengaluru", years: 18, languages: [E, "Hindi"], slot: dot("Sat, 07 Nov, 11:00 AM") },
  { id: "deepa-pillai", name: "Dr. Deepa Pillai", quals: ["MBBS", "DCH"], specialty: "Paediatrics", hospital: "Chennai", years: 11, languages: [E, "Malayalam", "Tamil"], slot: cal("Tomorrow, 09:30 AM") },
  { id: "harish-gowda", name: "Dr. Harish Gowda", quals: ["MBBS", "MD"], specialty: "General Medicine", hospital: "Bengaluru", years: 9, languages: [E, "Kannada"], slot: cal("Today, 06:30 PM") },
  // page 4
  { id: "nandini-rao", name: "Dr. Nandini Rao", quals: ["MBBS", "MS"], specialty: "Ophthalmology", hospital: "Hyderabad", years: 13, languages: [E, "Telugu"], slot: dot("Tomorrow, 12:00 PM") },
  { id: "farhan-ali", name: "Dr. Farhan Ali", quals: ["MBBS", "MD"], specialty: "General Medicine", hospital: "Hyderabad", years: 7, languages: [E, "Urdu", "Hindi"], slot: dot("Today, 07:00 PM") },
  { id: "revathi-subramanian", name: "Dr. Revathi Subramanian", quals: ["MBBS", "MD"], specialty: "Hematology", hospital: "Bengaluru", years: 10, languages: [E, "Tamil", "Kannada"], slot: dot("Fri, 06 Nov, 09:00 AM") },
  { id: "manoj-pillai", name: "Dr. Manoj Pillai", quals: ["MBBS", "DM"], specialty: "Neurology", hospital: "Chennai", years: 21, languages: [E, "Malayalam", "Tamil"], slot: dot("Mon, 09 Nov, 10:00 AM") },
  { id: "aditi-deshpande", name: "Dr. Aditi Deshpande", quals: ["MBBS", "DCH"], specialty: "Paediatrics", hospital: "Bengaluru", years: 6, languages: [E, "Marathi", "Hindi"], slot: cal("Today, 04:00 PM") },
  { id: "kiran-shetty", name: "Dr. Kiran Shetty", quals: ["MBBS", "MD"], specialty: "Dermatology", hospital: "Hyderabad", years: 8, languages: [E, "Telugu", "Kannada"], slot: cal("Tomorrow, 03:30 PM") },
  // Only reachable through a filter (Cardiology frames show four doctors).
  { id: "sameer-khan", name: "Dr. Sameer Khan", quals: ["MBBS", "DM"], specialty: "Cardiology", hospital: "Bengaluru", years: 13, languages: [E, "Hindi", "Urdu"], photo: "sameer-khan", slot: dot("Today, 02:00 PM"), listed: false },
  { id: "karthik-raman", name: "Dr. Karthik Raman", quals: ["MBBS", "DM"], specialty: "Cardiology", hospital: "Chennai", years: 13, languages: [E, "Tamil"], slot: dot("Tomorrow, 09:30 AM"), listed: false },
];

export const DOCTORS: Doctor[] = ROWS.map((row, index) => {
  const info = SPECIALTY_INFO[row.specialty];
  return {
    id: row.id,
    name: row.name,
    qualifications: row.quals,
    specialty: row.specialty,
    department: info.department,
    hospital: row.hospital,
    experienceYears: row.years,
    fee: 500,
    languages: row.languages,
    conditions: info.conditions,
    photo: row.photo ? `/images/doctors/${row.photo}.png` : undefined,
    nextAvailable: row.slot ? { label: row.slot[0], icon: row.slot[1] } : null,
    rank: index + 1,
    listed: row.listed !== false,
  };
});

export const getDoctor = (id: string | null | undefined) =>
  DOCTORS.find((doctor) => doctor.id === id);

/** Order of the filter radio lists in Figma (not alphabetical). */
export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Hematology",
  "Neurology",
  "Orthopaedics",
  "Paediatrics",
  "Ophthalmology",
  "General Medicine",
];
export const HOSPITALS: Hospital[] = ["Bengaluru", "Chennai", "Hyderabad"];

/** "Dr. Rajesh Kumar, MBBS, MD" */
export const doctorTitle = (d: Doctor) => [d.name, ...d.qualifications].join(", ");
/** Street addresses shown on the confirmation ("Hospital Location"). Only Bengaluru's is drawn. */
export const HOSPITAL_ADDRESS: Record<Hospital, string> = {
  Bengaluru: "80 Feet Road, Koramangala 4th Block, Bengaluru, Karnataka 560034",
  Chennai: "12 Greams Road, Thousand Lights, Chennai, Tamil Nadu 600006",
  Hyderabad: "Plot 45, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033",
};

/** "TiaMeds Hospital – Bengaluru" */
export const hospitalName = (hospital: Hospital) => `TiaMeds Hospital – ${hospital}`;
/** "Cardiology · TiaMeds Hospital – Bengaluru" */
export const doctorSubtitle = (d: Doctor) => `${d.specialty} · ${hospitalName(d.hospital)}`;
export const experienceLabel = (d: Doctor) => `${d.experienceYears} Years Experience`;
