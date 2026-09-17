export const adminPatients = [
  {
    id: "PT-1042",
    name: "Maya Anderson",
    initials: "MA",
    age: 34,
    provider: "Dr. Rivera",
    status: "Active",
    lastVisit: "Sep 12, 2026",
    color: "purple",
  },
  {
    id: "PT-1043",
    name: "James Peterson",
    initials: "JP",
    age: 51,
    provider: "Dr. Carter",
    status: "Active",
    lastVisit: "Sep 10, 2026",
    color: "gold",
  },
  {
    id: "PT-1044",
    name: "Diana Wells",
    initials: "DW",
    age: 28,
    provider: "Dr. Rivera",
    status: "New",
    lastVisit: "Sep 8, 2026",
    color: "blue",
  },
  {
    id: "PT-1045",
    name: "Noah Kim",
    initials: "NK",
    age: 43,
    provider: "Dr. Carter",
    status: "Active",
    lastVisit: "Sep 5, 2026",
    color: "teal",
  },
];

export const adminAppointments = [
  {
    date: "Today",
    time: "09:00 AM",
    patient: "Maya Anderson",
    type: "Annual wellness visit",
    provider: "Dr. Rivera",
    status: "Confirmed",
  },
  {
    date: "Today",
    time: "10:30 AM",
    patient: "James Peterson",
    type: "Follow-up consultation",
    provider: "Dr. Carter",
    status: "Confirmed",
  },
  {
    date: "Today",
    time: "11:15 AM",
    patient: "Diana Wells",
    type: "Lab results review",
    provider: "Dr. Rivera",
    status: "Pending",
  },
  {
    date: "Tomorrow",
    time: "08:45 AM",
    patient: "Noah Kim",
    type: "Medication check-in",
    provider: "Dr. Carter",
    status: "Confirmed",
  },
];

export const analyticsData = {
  metrics: [
    { label: "Patient visits", value: "286", change: "+12.4%" },
    { label: "No-show rate", value: "3.2%", change: "-0.8%" },
    { label: "Average wait time", value: "14 min", change: "-3 min" },
  ],
  monthlyVisits: [42, 55, 48, 66, 71, 63, 82, 75, 89, 94, 86, 101],
};
