import type { IconName } from "@/components/ui/icon";

/**
 * Mock content for the public homepage (Figma "G-01.00 Homepage - Option B" 123:16733).
 * Doctor counts and hospital details are the numbers/text drawn in the design; links go to the
 * Find a Doctor page filtered the way its URL query params understand (`specialty`, `hospital`).
 */

export const TRUST_TILES: { title: string; text: string; icon: IconName }[] = [
  { title: "8 hospitals, one network", text: "Book at any TiaMeds hospital", icon: "building-office-trust" },
  { title: "Experienced doctors", text: "40+ medical and surgical specialties", icon: "user-group-trust" },
  { title: "Easy booking", text: "No account needed, just your mobile number", icon: "calendar-trust" },
  { title: "Secure and private", text: "Verified by OTP before you confirm", icon: "shield-check-trust" },
];

export type HomeSpecialty = {
  id: string;
  name: string;
  description: string;
  doctors: number;
  icon: IconName;
  href: string;
  /** The mobile frame lists six specialties; Hematology and General Medicine are desktop only. */
  mobile: boolean;
};

// Desktop reads column-wise: Cardiology…Neurology, then Dermatology…General Medicine.
export const SPECIALTIES: HomeSpecialty[] = [
  { id: "cardiology", name: "Cardiology", description: "Heart and blood vessel care", doctors: 48, icon: "specialty-cardiology", href: "/find-doctor?specialty=Cardiology", mobile: true },
  { id: "orthopaedics", name: "Orthopaedics", description: "Bones, joints and sports injuries", doctors: 35, icon: "specialty-orthopaedics", href: "/find-doctor?specialty=Orthopedics", mobile: true },
  { id: "paediatrics", name: "Paediatrics", description: "Care for infants, children and teens", doctors: 40, icon: "specialty-paediatrics", href: "/find-doctor?specialty=Pediatrics", mobile: true },
  { id: "neurology", name: "Neurology", description: "Brain, spine and nerve conditions", doctors: 32, icon: "specialty-neurology", href: "/find-doctor?specialty=Neurology", mobile: true },
  { id: "dermatology", name: "Dermatology", description: "Skin, hair and nail conditions", doctors: 26, icon: "specialty-dermatology", href: "/find-doctor?specialty=Dermatology", mobile: true },
  { id: "hematology", name: "Hematology", description: "Blood disorders and blood cancers", doctors: 18, icon: "specialty-hematology", href: "/find-doctor?specialty=Hematology", mobile: false },
  { id: "ophthalmology", name: "Ophthalmology", description: "Eye care and vision", doctors: 22, icon: "specialty-ophthalmology", href: "/find-doctor?specialty=Ophthalmology", mobile: true },
  // The mock doctor directory has no General Medicine doctors, so this one opens a text search.
  { id: "general-medicine", name: "General Medicine", description: "Everyday health and check-ups", doctors: 64, icon: "specialty-general-medicine", href: "/find-doctor?q=General+Medicine", mobile: false },
];

export type HomeHospital = {
  id: string;
  name: string;
  location: string;
  bookHref: string;
  directionsHref: string;
};

export const HOSPITALS: HomeHospital[] = [
  { id: "bengaluru", name: "TiaMeds Hospital – Bengaluru", location: "Bengaluru, Karnataka", bookHref: "/find-doctor?hospital=Bengaluru", directionsHref: "https://www.google.com/maps/search/?api=1&query=TiaMeds+Hospital+Bengaluru" },
  { id: "chennai", name: "TiaMeds Hospital – Chennai", location: "Chennai, Tamil Nadu", bookHref: "/find-doctor?hospital=Chennai", directionsHref: "https://www.google.com/maps/search/?api=1&query=TiaMeds+Hospital+Chennai" },
  { id: "hyderabad", name: "TiaMeds Hospital – Hyderabad", location: "Hyderabad, Telangana", bookHref: "/find-doctor?hospital=Hyderabad", directionsHref: "https://www.google.com/maps/search/?api=1&query=TiaMeds+Hospital+Hyderabad" },
];
