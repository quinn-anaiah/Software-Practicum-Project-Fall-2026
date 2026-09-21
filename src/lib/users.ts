export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  initials: string;
};

export const demoUsers: DemoUser[] = [
  {
    id: "usr-001",
    name: "Dr. Rivera",
    email: "dr.rivera@careflow.test",
    password: "Careflow2026!",
    role: "Instructor",
    initials: "DR",
  },
  {
    id: "usr-002",
    name: "Morgan Lee",
    email: "morgan.lee@careflow.test",
    password: "Welcome123!",
    role: "Patient",
    initials: "ML",
  },

  {id: "usr-003",
   name: "Javier Lopez",
   email: "javier.lopez@careflow.test", 
   password: "Student123!", 
   role: "Student", 
   initials: "JL"
  },
];
