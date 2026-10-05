// Frontend-only preview content. Replace these exports with instructor API responses.
export const instructorOverviewPreview = {
  metrics: [
    { label: "Assigned learners", value: "42", note: "Across 3 active classrooms", tone: "indigo" },
    { label: "Active classrooms", value: "3", note: "1 begins next week", tone: "teal" },
    { label: "Cases in progress", value: "18", note: "6 awaiting review", tone: "amber" },
    { label: "Reviews due", value: "6", note: "Submitted in the last 48 hours", tone: "rose" },
  ],
  classrooms: [
    { name: "Clinical Foundations · Section A", learners: 18, groups: 5, activeCases: 2, progress: 68, next: "Review window Friday" },
    { name: "Interprofessional Practice · Section B", learners: 16, groups: 4, activeCases: 1, progress: 43, next: "Case launch Tuesday" },
    { name: "Ambulatory Care Lab", learners: 8, groups: 2, activeCases: 1, progress: 82, next: "Two reviews pending" },
  ],
  reviewQueue: [
    { learner: "Morgan Lee", classroom: "Clinical Foundations · Section A", item: "SOAP note", status: "Pending co-sign" },
    { learner: "Javier Lopez", classroom: "Ambulatory Care Lab", item: "Mock order set", status: "Ready to review" },
    { learner: "Avery Morgan", classroom: "Clinical Foundations · Section A", item: "Care plan", status: "Returned for revision" },
  ],
};

export const eligibleLearnerPreview = [
  { id: "avery", name: "Avery Morgan", subrole: "Physical Therapy" },
  { id: "javier", name: "Javier Lopez", subrole: "Physical Therapy" },
  { id: "samira", name: "Samira Patel", subrole: "Physical Therapy" },
  { id: "jordan", name: "Jordan Kim", subrole: "Physical Therapy" },
  { id: "casey", name: "Casey Nguyen", subrole: "Physical Therapy" },
  { id: "taylor", name: "Taylor Brooks", subrole: "Physical Therapy" },
  { id: "riley", name: "Riley Chen", subrole: "Nursing" },
  { id: "alexis", name: "Alexis Diaz", subrole: "Nursing" },
];

export function createClassroomPreview(discipline) {
  const disciplineLearners = eligibleLearnerPreview
    .filter((learner) => learner.subrole === discipline)
    .map((learner) => learner.name);

  return [
    {
    id: "foundation-a",
    name: `${discipline} Foundations · Section A`,
    term: "Fall 2026",
    discipline,
    learners: disciplineLearners,
    groups: [
      { id: "a1", name: "Group 1", learners: 3 },
      { id: "a2", name: "Group 2", learners: 3 },
    ],
    assignments: [
      { scenario: "Acute asthma exacerbation", target: "Group 1", state: "In progress", due: "Oct 14" },
      { scenario: "Post-operative medication reconciliation", target: "Group 2", state: "Scheduled", due: "Oct 18" },
    ],
    },
    {
    id: "practice-b",
    name: `${discipline} Clinical Reasoning · Section B`,
    term: "Fall 2026",
    discipline,
    learners: disciplineLearners.slice(0, 4),
    groups: [
      { id: "b1", name: "Team North", learners: 2 },
      { id: "b2", name: "Team South", learners: 2 },
    ],
    assignments: [
      { scenario: "Diabetes discharge planning", target: "Entire classroom", state: "In progress", due: "Oct 16" },
    ],
    },
  ];
}

export const scenarioPreview = [
  { id: "asthma", title: "Acute asthma exacerbation", discipline: "Nursing · Pharmacy", duration: "45 min", data: "Vitals, MAR, lab result" },
  { id: "med-rec", title: "Post-operative medication reconciliation", discipline: "Pharmacy · Nursing", duration: "35 min", data: "Medication list, orders, allergies" },
  { id: "diabetes", title: "Diabetes discharge planning", discipline: "Interprofessional", duration: "60 min", data: "Care plan, labs, education notes" },
];
