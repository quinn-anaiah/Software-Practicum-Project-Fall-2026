export type EncounterStatus =
  | "Scheduled"
  | "Checked in"
  | "Roomed"
  | "In progress"
  | "Checked out";

export type NoteStatus =
  | "Not started"
  | "In progress"
  | "Pending review"
  | "Returned for revision"
  | "Approved";

export interface AssignedCase {
  id: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  chiefComplaint: string;
  history: string;
  medications: string[];
  results: string;
  encounterStatus: EncounterStatus;
  noteStatus: NoteStatus;
  assignedBy: string;
}

export const studentCases: Record<string, AssignedCase[]> = {
  //this key matches our demo student user's ID! (usr-003)
  "usr-003": [
    {
      id: "CASE-1",
      patientName: "Test Patient — Alvarez",
      patientAge: 62,
      patientSex: "Female",
      chiefComplaint: "Follow-up for hypertension and new-onset dizziness",
      history:
        "Hypertension x8 years, Type 2 diabetes x3 years, no known drug allergies.",
      medications: ["Lisinopril 20mg daily", "Metformin 500mg twice daily"],
      results: "BP 148/92, HR 78, A1c 7.2% (last drawn 2 weeks ago).",
      encounterStatus: "Checked in",
      noteStatus: "Not started",
      assignedBy: "Dr. Rivera",
    },
  ],
};
