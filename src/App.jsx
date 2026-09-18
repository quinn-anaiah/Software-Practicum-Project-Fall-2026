import { useState } from "react";
import { adminPatients as initialPatients } from "./lib/adminData";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminAppointmentsPage from "./pages/AdminAppointmentsPage";
import AdminPatientsPage from "./pages/AdminPatientsPage";
import CareTeamPage from "./pages/CareTeamPage";
import DashboardLayout from "./components/DashboardLayout";
import HealthInsightsPage from "./pages/HealthInsightsPage";
import LoginPage from "./pages/LoginPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage";
import SettingsPage from "./pages/SettingsPage";
import { adminNavigation, patientNavigation } from "./lib/navigation";
import AdminAddUsersPage from "./pages/AdminAddUsersPage";
import AdminPatientInfoPage from "./pages/AdminPatientInfoPage";

const sessionKey = "careflow-demo-user";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem(sessionKey);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activePage, setActivePage] = useState("overview");
  const [patients, setPatients]=useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId]= useState(null);

  function addPatient(newPatient){
    setPatients((prev)=>[...prev, newPatient]);
  }

  function handleLogin(authenticatedUser) {
    sessionStorage.setItem(sessionKey, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    setActivePage("overview");
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    setUser(null);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const isAdministrator = user.role === "Administrator";
  const pages = isAdministrator
    ? {
        overview: AdminDashboardPage,
        patients: AdminPatientsPage,
        addPatient: AdminAddUsersPage,
        patientInfo: AdminPatientInfoPage,
        appointments: AdminAppointmentsPage,
        analytics: AdminAnalyticsPage,
        settings: SettingsPage,
      }
    : {
        overview: PatientDashboardPage,
        careTeam: CareTeamPage,
        appointments: PatientAppointmentsPage,
        insights: HealthInsightsPage,
        settings: SettingsPage,
      };
  const ActivePage = pages[activePage] || pages.overview;

  return (
    <DashboardLayout
      activePage={activePage}
      navItems={isAdministrator ? adminNavigation : patientNavigation}
      onLogout={handleLogout}
      onNavigate={setActivePage}
      user={user}
    >
      <ActivePage user={user}
                  patients={patients}
                  addPatient={addPatient}
                  onNavigate={setActivePage}
                  selectedPatientId={selectedPatientId}
                  setSelectedPatientId={setSelectedPatientId} />
    </DashboardLayout>
  );
}

export default App;
