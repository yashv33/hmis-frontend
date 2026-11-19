export type Hospital = "Bengaluru" | "Chennai" | "Hyderabad";

export type Doctor = {
  id: string;
  /** "Dr. Rajesh Kumar" — qualifications are appended for display. */
  name: string;
  qualifications: string[];
  /** Shown on the card ("Cardiology"); Figma calls this line "Department and Hospital". */
  specialty: string;
  /** Hospital department the specialty belongs to (not shown on the cards). */
  department: string;
  hospital: Hospital;
  experienceYears: number;
  /** Consultation fee in INR, used by the booking summary / payment steps. */
  fee: number;
  languages: string[];
  /** Extra search terms ("chest pain") so the "condition" search from the placeholder works. */
  conditions: string[];
  /** Portrait in /public/images/doctors. Doctors without one get the placeholder avatar. */
  photo?: string;
  /**
   * Next bookable slot, or `null` when online booking is not available for this
   * doctor ("Call us to book a time"). `icon` is which marker the design draws in front of it:
   * a green dot or a calendar icon (the frames mix them, so it is data, not derived).
   */
  nextAvailable: { label: string; icon: "dot" | "calendar" } | null;
  /** Position used by the mock "Earliest available" sort (the design's own order). */
  rank: number;
  /**
   * False for the two cardiologists that only appear once a filter is applied: the design lists
   * 24 doctors over four pages, yet its Cardiology filter shows four.
   */
  listed: boolean;
};
