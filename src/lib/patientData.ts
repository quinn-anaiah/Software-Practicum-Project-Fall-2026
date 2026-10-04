export const patientProfiles = {
  "usr-002": {
    provider: {
      name: "Dr. Evelyn Carter",
      specialty: "Primary Care Physician",
      initials: "EC",
    },
    careTeam: [
      {
        name: "Dr. Evelyn Carter",
        role: "Primary Care Physician",
        initials: "EC",
        color: "teal",
        note: "Your primary provider",
      },
      {
        name: "Aisha Bennett, RN",
        role: "Care Coordinator",
        initials: "AB",
        color: "purple",
        note: "Available Mon–Fri",
      },
      {
        name: "Liam Cole, PharmD",
        role: "Clinical Pharmacist",
        initials: "LC",
        color: "gold",
        note: "Medication questions",
      },
    ],
    nextAppointment: {
      date: "September 24, 2026",
      time: "10:30 AM",
      type: "Annual wellness visit",
      location: "Careflow Medical Center · Suite 204",
    },
    medications: [
      {
        name: "Lisinopril",
        dosage: "10 mg · once daily",
        refill: "18 days remaining",
        color: "purple",
      },
      {
        name: "Vitamin D3",
        dosage: "2,000 IU · once daily",
        refill: "Refill available",
        color: "gold",
      },
    ],
    updates: [
      {
        title: "Your after-visit summary is ready",
        detail: "From your check-in on September 12",
        date: "Sep 12",
      },
      {
        title: "Lab results reviewed",
        detail: "Dr. Carter added a note to your results",
        date: "Sep 10",
      },
    ],
    appointments: [
      {
        date: "Sep 24",
        time: "10:30 AM",
        type: "Annual wellness visit",
        provider: "Dr. Evelyn Carter",
        status: "Upcoming",
      },
      {
        date: "Sep 12",
        time: "02:00 PM",
        type: "Care check-in",
        provider: "Aisha Bennett, RN",
        status: "Completed",
      },
      {
        date: "Aug 18",
        time: "09:15 AM",
        type: "Medication review",
        provider: "Liam Cole, PharmD",
        status: "Completed",
      },
    ],
    insights: [
      {
        title: "Blood pressure check-in",
        value: "On track",
        description: "Your latest readings are within your care plan range.",
        color: "teal",
      },
      {
        title: "Medication routine",
        value: "100%",
        description: "You’re up to date with your current medications.",
        color: "purple",
      },
      {
        title: "Preventive care",
        value: "1 reminder",
        description: "Schedule your seasonal flu vaccine when available.",
        color: "gold",
      },
    ],
  },
};

export function getPatientProfile(user) {
  const savedProfile = patientProfiles[user.id];
  if (savedProfile) return savedProfile;

  return {
    provider: {
      name: "Careflow Care Team",
      specialty: "Patient support",
      initials: "CF",
    },
    careTeam: [
      {
        name: "Careflow Patient Support",
        role: "Care navigation team",
        initials: "CF",
        color: "teal",
        note: "Your starting point",
      },
      {
        name: "Careflow Scheduling",
        role: "Appointment support",
        initials: "CS",
        color: "purple",
        note: "Help with visits",
      },
    ],
    nextAppointment: {
      date: "To be scheduled",
      time: "—",
      type: "New patient welcome visit",
      location: "Careflow Medical Center",
    },
    medications: [],
    updates: [
      {
        title: "Your Careflow account is ready",
        detail: "Your care team will add visit details when they are available.",
        date: "Today",
      },
    ],
    appointments: [
      {
        date: "Next",
        time: "To be scheduled",
        type: "New patient welcome visit",
        provider: "Careflow Patient Support",
        status: "Requested",
      },
    ],
    insights: [
      {
        title: "Account setup",
        value: "Complete",
        description: "Your Careflow profile has been created.",
        color: "teal",
      },
      {
        title: "Care plan",
        value: "Pending",
        description: "Your care team will add personalized guidance here.",
        color: "purple",
      },
      {
        title: "Next step",
        value: "Schedule",
        description: "Request your first appointment when you are ready.",
        color: "gold",
      },
    ],
  };
}
