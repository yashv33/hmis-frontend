import type { Metadata } from "next";
import { PatientDetailsStep } from "@/components/booking/patient-details-step";

export const metadata: Metadata = {
  title: "Patient details",
  description: "Verify an existing patient or add the details of a new patient.",
};

// Booking step 3 of 4 (Figma G-01.04). Guarded like every later step.
export default function PatientDetailsPage() {
  return <PatientDetailsStep />;
}
