import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { hospitalName } from "@/lib/find-doctor/doctors";
import type { Doctor } from "@/lib/find-doctor/types";

const PHOTO_SIZE = { 40: "size-10", 48: "size-12", 56: "size-14", 72: "size-[72px]" } as const;

/**
 * Doctor portrait, 12px radius: 72px (selected-doctor card), 56px (its mobile version), 48px
 * (summary card) or 40px (mobile summary). Doctors without a photo get a plain lavender tile.
 */
export function DoctorPhoto({ doctor, size }: { doctor: Doctor; size: keyof typeof PHOTO_SIZE }) {
  const box = cn("shrink-0 rounded-sm bg-secondary-100", PHOTO_SIZE[size]);
  return doctor.photo ? (
    <Image src={doctor.photo} alt="" width={size} height={size} className={cn(box, "object-cover")} />
  ) : (
    <span aria-hidden="true" className={box} />
  );
}

/**
 * One "label … value" row with a top divider (Figma "Doctor Facts" / "Summary Rows"). `compact` is
 * the mobile 8px padding; `labelWidth` the label column (152px in the selected-doctor card, 140px
 * elsewhere).
 */
export function FactRow({
  label,
  value,
  compact = false,
  labelWidth = 140,
  last = false,
}: {
  label: string;
  value: ReactNode;
  compact?: boolean;
  labelWidth?: 140 | 152;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 border-t border-pneutral-200 font-heading text-typo-md font-medium",
        compact ? "py-2" : "py-3",
        last && "border-b",
      )}
    >
      <dt className={cn("shrink-0 text-pneutral-700", labelWidth === 152 ? "w-[152px]" : "w-[140px]")}>
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-right text-pneutral-900">{value}</dd>
    </div>
  );
}

/**
 * Figma "Selected Doctor Card" — desktop right rail 107:7022 (384px, 24px padding) and the mobile
 * version in the step header 109:7902 (12px padding, 56px photo, denser rows). Doctor, facts,
 * next free slot, the fee note and "Change doctor" (back to Find a Doctor).
 */
export function SelectedDoctorCard({
  doctor,
  variant,
  onChangeDoctor,
}: {
  doctor: Doctor;
  variant: "rail" | "header";
  onChangeDoctor: () => void;
}) {
  const rail = variant === "rail";
  const facts: [string, string][] = [
    ["Specialty", doctor.specialty],
    ["Experience", `${doctor.experienceYears} Years`],
    ["Available Hospital", hospitalName(doctor.hospital)],
    ["Languages", doctor.languages.join(", ")],
    ["Consultation Modes", "In-person, Video"],
    ["Consultation Fee", `₹${doctor.fee}`],
  ];

  return (
    <section
      aria-label="Selected doctor"
      className={cn(
        "flex flex-col items-start rounded-lg border border-pneutral-200 bg-white",
        rail ? "gap-4 p-6" : "gap-3 p-3",
      )}
    >
      {rail && (
        <p className="font-heading text-typo-sm font-semibold text-secondary-700">SELECTED DOCTOR</p>
      )}
      <div className={cn("flex w-full items-center", rail ? "gap-4" : "gap-3")}>
        <DoctorPhoto doctor={doctor} size={rail ? 72 : 56} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            className={cn(
              "font-heading font-semibold text-pneutral-900",
              rail ? "text-h6" : "text-typo-lg",
            )}
          >
            {doctor.name}
          </p>
          <p
            className={cn(
              "text-pneutral-700",
              rail ? "font-paragraph text-typo-md" : "font-heading text-typo-sm",
            )}
          >
            {doctor.qualifications.join(", ")}
          </p>
        </div>
      </div>

      <dl className="w-full">
        {facts.map(([label, value], index) => (
          <FactRow
            key={label}
            label={label}
            value={value}
            compact={!rail}
            labelWidth={rail ? 152 : 140}
            last={index === facts.length - 1}
          />
        ))}
      </dl>

      {doctor.nextAvailable && (
        <p className="flex w-full items-center gap-2 rounded-xsm bg-pneutral-50 px-3 py-2 font-heading text-typo-sm">
          <Icon name="status-dot" />
          <span className="text-pneutral-700">Next available</span>
          <span className="min-w-0 flex-1 text-right font-semibold text-pneutral-900">
            {doctor.nextAvailable.label}
          </span>
        </p>
      )}

      <p className="font-heading text-typo-sm text-pneutral-700">
        The consultation fee is confirmed, with any discount and tax, on the review screen before
        you pay.
      </p>

      <Button
        variant="text"
        size="sm"
        shape={rail ? "rounded" : "pill"}
        onClick={onChangeDoctor}
        className="w-[125px]"
      >
        Change doctor
      </Button>
    </section>
  );
}
