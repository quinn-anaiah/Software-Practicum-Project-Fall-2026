import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  instructorNavigation,
  patientNavigation,
  studentNavigation,
} from "../lib/navigation";
import DatabasePlaceholderPage from "../pages/DatabasePlaceholderPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SettingsPage from "../pages/SettingsPage";

function placeholder(path, eyebrow, title, description) {
  return { path, eyebrow, title, description };
}

const routesByRole = {
  Instructor: {
    navigation: instructorNavigation,
    pages: {
      overview: placeholder(
        "/instructor",
        "Instructor workspace",
        "Your instructor workspace is ready",
        "Cohort activity, scenario progress, and review queues will appear here once they are connected to the database.",
      ),
      cohorts: placeholder(
        "/instructor/cohorts",
        "Cohort & roster",
        "No classroom rosters yet",
        "Create and manage classroom rosters here after the cohort data API is connected.",
      ),
      cases: placeholder(
        "/instructor/cases",
        "Cases & assignments",
        "No training scenarios yet",
        "Training scenarios and learner assignments will load from the database here.",
      ),
      expectations: placeholder(
        "/instructor/expectations",
        "Expectations",
        "No expectations configured yet",
        "Rubrics, documentation requirements, and clinical traps will be loaded from the database.",
      ),
      monitoring: placeholder(
        "/instructor/monitoring",
        "Monitor activity",
        "No learner activity yet",
        "Encounter states and submission progress will appear here when cases are assigned.",
      ),
      review: placeholder(
        "/instructor/review",
        "Review & co-sign",
        "No work pending review",
        "Submitted notes and mock orders will appear here for review and attestation.",
      ),
      feedback: placeholder(
        "/instructor/feedback",
        "Feedback & grades",
        "No work available for grading",
        "Rubric scores, annotations, and feedback will load here once submissions exist.",
      ),
      oversight: placeholder(
        "/instructor/oversight",
        "Cohort oversight",
        "No cohort analytics yet",
        "Aggregate performance and audit activity will appear here when database reporting is connected.",
      ),
      closeout: placeholder(
        "/instructor/closeout",
        "Closeout",
        "No cases ready for closeout",
        "Completion, grade release, and archiving controls will appear here for completed scenarios.",
      ),
      settings: { path: "/instructor/settings", Component: SettingsPage },
    },
  },
  Patient: {
    navigation: patientNavigation,
    pages: {
      overview: placeholder(
        "/patient",
        "My health",
        "Your care portal is ready",
        "Appointments, medications, and care updates will appear once records are connected to your profile.",
      ),
      careTeam: placeholder(
        "/patient/care-team",
        "My care team",
        "No care team is assigned yet",
        "Your providers and support contacts will appear here after they are assigned.",
      ),
      appointments: placeholder(
        "/patient/appointments",
        "My schedule",
        "No appointments yet",
        "Upcoming visits and care history will appear here once appointment data is connected.",
      ),
      insights: placeholder(
        "/patient/insights",
        "Health insights",
        "No health insights yet",
        "Care-plan reminders and trends will appear here when clinical data is available.",
      ),
      settings: { path: "/patient/settings", Component: SettingsPage },
    },
  },
  Student: {
    navigation: studentNavigation,
    pages: {
      overview: placeholder(
        "/student",
        "My cases",
        "Your learning workspace is ready",
        "Assigned training scenarios, encounter status, and documentation requirements will appear here.",
      ),
      caseDetail: placeholder(
        "/student/case",
        "Assigned case",
        "No case selected",
        "Case details will load here after your instructor assigns a scenario.",
      ),
      noteForm: placeholder(
        "/student/note",
        "Clinical note",
        "No note available",
        "Documentation tools will become available after a case is assigned.",
      ),
      orderEntry: placeholder(
        "/student/orders",
        "Mock orders",
        "No orders available",
        "Mock order entry will become available after a case is assigned.",
      ),
      settings: { path: "/student/settings", Component: SettingsPage },
    },
  },
};

function getRouteConfig(role) {
  return routesByRole[role] || routesByRole.Patient;
}

function getDefaultPath(user) {
  return user ? getRouteConfig(user.role).pages.overview.path : "/login";
}

function DashboardRoute({ onLogout, user }) {
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return <Navigate replace to="/login" />;

  const routeConfig = getRouteConfig(user.role);
  const activePageEntry = Object.entries(routeConfig.pages).find(
    ([, page]) => page.path === location.pathname,
  );

  if (!activePageEntry) {
    return <Navigate replace to={routeConfig.pages.overview.path} />;
  }

  const [activePage, page] = activePageEntry;

  function navigateTo(pageId) {
    navigate(routeConfig.pages[pageId]?.path || routeConfig.pages.overview.path);
  }

  const ActivePage = page.Component;
  const content = ActivePage ? (
    <ActivePage user={user} />
  ) : (
    <DatabasePlaceholderPage {...page} />
  );

  return (
    <DashboardLayout
      activePage={activePage}
      navItems={routeConfig.navigation}
      onLogout={onLogout}
      onNavigate={navigateTo}
      user={user}
    >
      {content}
    </DashboardLayout>
  );
}

function AppRouter({ onLogin, onLogout, user }) {
  const navigate = useNavigate();

  function handleLogin(authenticatedUser) {
    onLogin(authenticatedUser);
    navigate(getDefaultPath(authenticatedUser), { replace: true });
  }

  function handleLogout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  const protectedRoute = <DashboardRoute onLogout={handleLogout} user={user} />;

  return (
    <Routes>
      <Route
        element={
          user ? (
            <Navigate replace to={getDefaultPath(user)} />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
        path="/login"
      />
      <Route
        element={
          user ? (
            <Navigate replace to={getDefaultPath(user)} />
          ) : (
            <RegisterPage />
          )
        }
        path="/register"
      />
      <Route element={protectedRoute} path="/instructor/*" />
      <Route element={protectedRoute} path="/patient/*" />
      <Route element={protectedRoute} path="/student/*" />
      <Route element={<Navigate replace to={getDefaultPath(user)} />} path="*" />
    </Routes>
  );
}

export default AppRouter;
