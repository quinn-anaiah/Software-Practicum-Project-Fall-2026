// Note types an instructor can assign. Only SOAP has a student form so far.
export const NOTE_TYPES = [
  { id: "soap", label: "SOAP note", available: true },
  { id: "pharmacy_mtm", label: "Pharmacy medication review (MTM)", available: false },
  { id: "pt_daily", label: "Physical therapy daily note", available: false },
];