import {Navigate, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {instructorNavigation, patientNavigation, studentNavigation} from "../lib/navigation";
import CareTeamPage from "../pages/CareTeamPage";
import HealthInsightsPage from "../pages/HealthInsightsPage";
import InstructorCasesPage from "../pages/InstructorCasesPage";
import InstructorCloseoutPage from "../pages/InstructorCloseoutPage";
import InstructorCohortsPage from "../pages/InstructorCohortsPage";
import InstructorDashboardPage from "../pages/InstructorDashboardPage";
import InstructorExpectationsPage from "../pages/InstructorExpectationsPage";
import InstructorFeedbackPage from "../pages/InstructorFeedbackPage";
import InstructorMonitoringPage from "../pages/InstructorMonitoringPage";
import InstructorOversightPage from "../pages/InstructorOversightPage";
import InstructorReviewPage from "../pages/InstructorReviewPage";
import LoginPage from "../pages/LoginPage";
import PatientAppointmentsPage from "../pages/PatientAppointmentsPage";
import PatientDashboardPage from "../pages/PatientDashboardPage";
import SettingsPage from "../pages/SettingsPage";
import StudentCaseDetailPage from "../pages/StudentCaseDetailPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import StudentNoteFormPage from "../pages/StudentNoteFormPage";
import StudentOrderEntryPage from "../pages/StudentOrderEntryPage";

const routesByRole = {
  Instructor: {
    navigation: instructorNavigation,
    pages: {
      overview: { path: "/instructor", Component: InstructorDashboardPage },
      cohorts: { path: "/instructor/cohorts", Component: InstructorCohortsPage },
      cases: { path: "/instructor/cases", Component: InstructorCasesPage },
      expectations: {
        path: "/instructor/expectations",
        Component: InstructorExpectationsPage,
      },
      monitoring: {
        path: "/instructor/monitoring",
        Component: InstructorMonitoringPage,
      },
      review: { path: "/instructor/review", Component: InstructorReviewPage },
      feedback: { path: "/instructor/feedback", Component: InstructorFeedbackPage },
      oversight: {
        path: "/instructor/oversight",
        Component: InstructorOversightPage,
      },
      closeout: { path: "/instructor/closeout", Component: InstructorCloseoutPage },
      settings: { path: "/instructor/settings", Component: SettingsPage },
    },
  },
  Patient: {
    navigation: patientNavigation,
    pages: {
      overview: { path: "/patient", Component: PatientDashboardPage },
      careTeam: { path: "/patient/care-team", Component: CareTeamPage },
      appointments: {
        path: "/patient/appointments",
        Component: PatientAppointmentsPage,
      },
      insights: { path: "/patient/insights", Component: HealthInsightsPage },
      settings: { path: "/patient/settings", Component: SettingsPage },
    },
  },
  Student: {
    navigation: studentNavigation,
    pages: {
      overview: { path: "/student", Component: StudentDashboardPage },
      caseDetail: { path: "/student/case", Component: StudentCaseDetailPage },
      noteForm: { path: "/student/note", Component: StudentNoteFormPage },
      orderEntry: { path: "/student/orders", Component: StudentOrderEntryPage },
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

function DashboardRoute({ onLogout, pageProps, user }) {
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
  const ActivePage = page.Component;

  function navigateTo(pageId) {
    navigate(routeConfig.pages[pageId]?.path || routeConfig.pages.overview.path);
  }

  return (
    <DashboardLayout
      activePage={activePage}
      navItems={routeConfig.navigation}
      onLogout={onLogout}
      onNavigate={navigateTo}
      user={user}
    >
      <ActivePage {...pageProps} onNavigate={navigateTo} user={user} />
    </DashboardLayout>
  );
}

function AppRouter({ onLogin, onLogout, pageProps, user }) {
  const navigate = useNavigate();

  function handleLogin(authenticatedUser) {
    onLogin(authenticatedUser);
    navigate(getDefaultPath(authenticatedUser), { replace: true });
  }

  function handleLogout() {
    onLogout();
    navigate("/login", { replace: true });
  }

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
          <DashboardRoute
            onLogout={handleLogout}
            pageProps={pageProps}
            user={user}
          />
        }
        path="/instructor/*"
      />
      <Route
        element={
          <DashboardRoute
            onLogout={handleLogout}
            pageProps={pageProps}
            user={user}
          />
        }
        path="/patient/*"
      />
      <Route
        element={
          <DashboardRoute
            onLogout={handleLogout}
            pageProps={pageProps}
            user={user}
          />
        }
        path="/student/*"
      />
      <Route element={<Navigate replace to={getDefaultPath(user)} />} path="*" />
    </Routes>
  );
}

export default AppRouter;
