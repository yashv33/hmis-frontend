import type { Metadata } from "next";
import { Suspense } from "react";
import { AppointmentDetailsStep } from "@/components/booking/appointment-details-step";
import { BookingSkeleton } from "@/components/booking/booking-layout";

export const metadata: Metadata = {
  title: "Select Appointment Details",
  description: "Choose the hospital, consultation type and mode, date and time for your appointment.",
};

// Booking step 2 of 4 (Figma G-01.02). Public: guests book without logging in. The doctor comes
// from `?doctor=<id>` (Find a Doctor), so the step reads the URL inside a Suspense boundary.
export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<BookingSkeleton step={2} title="Select Appointment Details" />}>
      <AppointmentDetailsStep />
    </Suspense>
  );
}
