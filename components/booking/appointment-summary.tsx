import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatDate, formatTime, parseISODate, WEEKDAYS_SHORT } from "@/lib/booking/dates";
import {
  consultationModeLabel,
  consultationTypeLabel,
  type BookingDraft,
} from "@/lib/booking/store";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";
import { DoctorPhoto, FactRow } from "./selected-doctor-card";

type SummaryProps = {
  doctor: Doctor;
  draft: BookingDraft;
  /** "Edit appointment details" — goes back to Select Appointment Details. */
  onEdit: () => void;
};

/**
 * Figma "Appointment Summary Card" — desktop right rail (116:9064, 384px, 24px padding): "YOUR
 * APPOINTMENT", the doctor (48px photo, "Cardiology · MBBS, MD") and five rows, then "Edit
 * appointment details".
 */
export function AppointmentSummaryCard({ doctor, draft, onEdit }: SummaryProps) {
  const rows: [string, string][] = [
    ["Hospital Name", hospitalName(draft.hospital ?? doctor.hospital)],
    ["Consultation Type", consultationTypeLabel(draft.consultationType)],
    ["Consultation Mode", consultationModeLabel(draft.mode)],
    ["Appointment Date", draft.date ? formatDate(draft.date) : "—"],
    ["Appointment Time", draft.time ? formatTime(draft.time) : "—"],
  ];
  return (
    <section
      aria-label="Your appointment"
      className="flex flex-col items-start gap-4 rounded-lg border border-pneutral-200 bg-white p-6"
    >
      <p className="font-heading text-typo-sm font-semibold text-secondary-700">YOUR APPOINTMENT</p>
      <div className="flex w-full items-center gap-3">
        <DoctorPhoto doctor={doctor} size={48} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-heading text-typo-lg font-semibold text-pneutral-900">{doctor.name}</p>
          <p className="font-heading text-typo-sm text-pneutral-700">
            {doctor.specialty} · {doctor.qualifications.join(", ")}
          </p>
        </div>
      </div>
      <dl className="w-full">
        {rows.map(([label, value], index) => (
          <FactRow key={label} label={label} value={value} last={index === rows.length - 1} />
        ))}
      </dl>
      <Button variant="text" size="sm" shape="rounded" onClick={onEdit} className="w-[195px]">
        Edit appointment details
      </Button>
    </section>
  );
}

/** "Thu, 05/11/2026 · 10:30 AM · In-person" */
const metaLine = (draft: BookingDraft) =>
  [
    draft.date
      ? `${WEEKDAYS_SHORT[parseISODate(draft.date).getDay()]}, ${formatDate(draft.date)}`
      : null,
    draft.time ? formatTime(draft.time) : null,
    consultationModeLabel(draft.mode),
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * The mobile "Appointment Summary Card" (117:9228) inside the lavender step header: 40px photo,
 * name, "Thu, 05/11/2026 · 10:30 AM · In-person" and "Edit appointment details".
 */
export function AppointmentSummaryMobile({
  doctor,
  draft,
  onEdit,
  className,
}: SummaryProps & { className?: string }) {
  return (
    <section
      aria-label="Your appointment"
      className={cn("flex flex-col items-start gap-2 rounded-lg border border-pneutral-200 bg-white p-3", className)}
    >
      <div className="flex w-full items-center gap-3">
        <DoctorPhoto doctor={doctor} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-heading text-typo-lg font-semibold text-pneutral-900">{doctor.name}</p>
          <p className="font-heading text-typo-sm text-pneutral-700">{metaLine(draft)}</p>
        </div>
      </div>
      <Button variant="text" size="sm" shape="pill" onClick={onEdit} className="w-[195px]">
        Edit appointment details
      </Button>
    </section>
  );
}
