export type CaseProgress =
  | "Not started"
  | "In progress"
  | "Pending review"
  | "Completed";

export const assignedCohort = {
  id: "cohort-fall-26-a",
  name: "Clinical Documentation · Fall 2026",
  section: "Section A",
  term: "Sep 14 – Dec 11, 2026",
  students: [
    {
      id: "usr-003",
      name: "Javier Lopez",
      initials: "JL",
      group: "Group 1",
      status: "Active",
    },
    {
      id: "stu-004",
      name: "Amina Patel",
      initials: "AP",
      group: "Group 1",
      status: "Active",
    },
    {
      id: "stu-005",
      name: "Ethan Brooks",
      initials: "EB",
      group: "Group 2",
      status: "Active",
    },
    {
      id: "stu-006",
      name: "Sofia Nguyen",
      initials: "SN",
      group: "Group 2",
      status: "Active",
    },
  ],
};

export const trainingCases = [
  {
    id: "CASE-1",
    title: "Hypertension follow-up",
    patientName: "Test Patient — Alvarez",
    startingStatus: "Checked in",
    availableData: ["Vitals", "Medication list", "A1c result", "Prior note"],
    assignment: "Group 1",
    dueDate: "Sep 28, 2026 · 11:59 PM",
    summary:
      "Dizziness after a medication adjustment in a patient with hypertension and type 2 diabetes.",
  },
  {
    id: "CASE-2",
    title: "Post-operative wound check",
    patientName: "Test Patient — Porter",
    startingStatus: "Roomed",
    availableData: ["Vitals", "Wound photo", "Discharge summary", "Allergies"],
    assignment: "Group 2",
    dueDate: "Sep 30, 2026 · 11:59 PM",
    summary:
      "A wound check scenario with a change in symptoms that needs clear escalation documentation.",
  },
];

export const starterClassrooms = [
  {
    id: "classroom-1",
    name: "Classroom 1 · Section A",
    students: assignedCohort.students,
    groups: ["Group 1", "Group 2"],
    cases: trainingCases,
    rosterConfirmed: true,
  },
  {
    id: "classroom-2",
    name: "Classroom 2 · Section B",
    students: [
      {
        id: "stu-007",
        name: "Olivia Chen",
        initials: "OC",
        group: "Group 3",
        status: "Active",
      },
      {
        id: "stu-008",
        name: "Marcus Reed",
        initials: "MR",
        group: "Group 3",
        status: "Active",
      },
      {
        id: "stu-009",
        name: "Priya Shah",
        initials: "PS",
        group: "Group 4",
        status: "Active",
      },
      {
        id: "stu-010",
        name: "Theo Martin",
        initials: "TM",
        group: "Group 4",
        status: "Active",
      },
    ],
    groups: ["Group 3", "Group 4"],
    cases: [
      {
        id: "CASE-1",
        title: "Respiratory symptom triage",
        patientName: "Test Patient — Brooks",
        startingStatus: "Scheduled",
        availableData: ["Vitals", "Allergies", "Prior note"],
        assignment: "Group 3",
        assignmentType: "group",
        dueDate: "Oct 3, 2026 · 11:59 PM",
        summary:
          "A respiratory triage scenario that asks learners to distinguish urgency, document the assessment, and identify appropriate next steps.",
      },
      {
        id: "CASE-2",
        title: "Medication reconciliation",
        patientName: "Test Patient — Harris",
        startingStatus: "Checked in",
        availableData: ["Medication list", "Discharge summary", "Lab results"],
        assignment: "Group 4",
        assignmentType: "group",
        dueDate: "Oct 5, 2026 · 11:59 PM",
        summary:
          "A transition-of-care scenario with duplicate medications and a follow-up plan to document.",
      },
    ],
    rosterConfirmed: true,
  },
];

export const instructorExpectations = {
  rubric: [
    {
      criterion: "Clinical reasoning",
      weight: "35%",
      detail:
        "Connect symptoms, history, and results to a supported assessment.",
    },
    {
      criterion: "Documentation quality",
      weight: "30%",
      detail: "Use a complete, clear, and structured SOAP note.",
    },
    {
      criterion: "Safety awareness",
      weight: "25%",
      detail: "Identify risks, escalation needs, and medication concerns.",
    },
    {
      criterion: "Professional communication",
      weight: "10%",
      detail: "Use concise, respectful co-signature-ready language.",
    },
  ],
  requiredDocumentation: [
    "Chief concern and subjective history",
    "Focused assessment with relevant results",
    "Assessment and prioritized plan",
    "Medication reconciliation",
    "Patient education and follow-up",
  ],
  coSignature: "Required before the note can be marked complete.",
  traps: [
    {
      label: "Medication interaction",
      detail:
        "A new NSAID order may worsen the patient's blood pressure control.",
    },
    {
      label: "Abnormal result",
      detail:
        "A1c of 7.2% requires acknowledgment and follow-up in the assessment.",
    },
  ],
};

export const learnerActivity: Array<{
  studentId: string;
  student: string;
  initials: string;
  group: string;
  caseTitle: string;
  encounterStatus: string;
  noteStatus: CaseProgress;
  lastActivity: string;
}> = [
  {
    studentId: "usr-003",
    student: "Javier Lopez",
    initials: "JL",
    group: "Group 1",
    caseTitle: "Hypertension follow-up",
    encounterStatus: "Checked in",
    noteStatus: "In progress",
    lastActivity: "8 min ago",
  },
  {
    studentId: "stu-004",
    student: "Amina Patel",
    initials: "AP",
    group: "Group 1",
    caseTitle: "Hypertension follow-up",
    encounterStatus: "Checked out",
    noteStatus: "Pending review",
    lastActivity: "26 min ago",
  },
  {
    studentId: "stu-005",
    student: "Ethan Brooks",
    initials: "EB",
    group: "Group 2",
    caseTitle: "Post-operative wound check",
    encounterStatus: "Roomed",
    noteStatus: "Not started",
    lastActivity: "Yesterday",
  },
  {
    studentId: "stu-006",
    student: "Sofia Nguyen",
    initials: "SN",
    group: "Group 2",
    caseTitle: "Post-operative wound check",
    encounterStatus: "Checked out",
    noteStatus: "Completed",
    lastActivity: "Yesterday",
  },
];

export const submittedWork = {
  student: "Amina Patel",
  initials: "AP",
  caseTitle: "Hypertension follow-up",
  submittedAt: "Sep 21, 2026 · 2:14 PM",
  note: {
    subjective:
      "Reports intermittent dizziness since the new pain medication was started. Denies chest pain or shortness of breath.",
    assessment:
      "Hypertension remains above goal. Dizziness may be medication-related; A1c also remains elevated.",
    plan: "Review medication list with preceptor, discuss blood pressure monitoring, and arrange follow-up.",
  },
  mockOrders: [
    "Continue lisinopril 20 mg daily",
    "Add ibuprofen 600 mg every 6 hours as needed",
    "Repeat A1c in 3 months",
  ],
};

export const cohortOversight = {
  commonErrors: [
    { label: "Medication interaction not identified", count: 2 },
    { label: "Abnormal A1c not addressed", count: 1 },
    { label: "Missing follow-up timeframe", count: 1 },
  ],
  auditLog: [
    {
      event: "Amina Patel submitted CASE-1",
      detail: "Documentation entered pending review",
      time: "2:14 PM",
    },
    {
      event: "Javier Lopez opened CASE-1",
      detail: "Encounter status updated to checked in",
      time: "2:05 PM",
    },
    {
      event: "Dr. Rivera updated rubric",
      detail: "Safety awareness criterion revised",
      time: "Yesterday",
    },
  ],
};
