import { useState } from "react";
import { adminPatients as initialPatients } from "./lib/adminData";
import { starterClassrooms } from "./lib/instructorData";
import { studentCases as initialStudentCases } from "./lib/studentData";
import AppRouter from "./routes/AppRouter";

const sessionKey = "careflow-demo-user";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem(sessionKey);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [studentCases, setStudentCases] = useState(initialStudentCases);
  const [studentNotes, setStudentNotes] = useState({});
  const [studentOrders, setStudentOrders] = useState({});
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [classrooms, setClassrooms] = useState(starterClassrooms);
  const [activeClassroomId, setActiveClassroomId] = useState("classroom-1");
  const activeClassroom =
    classrooms.find((classroom) => classroom.id === activeClassroomId) ||
    classrooms[0];
  const cohortStudents = activeClassroom.students;
  const cohortGroups = activeClassroom.groups;
  const instructorCases = activeClassroom.cases;
  const rosterConfirmed = activeClassroom.rosterConfirmed;

  function addPatient(newPatient) {
    setPatients((previousPatients) => [...previousPatients, newPatient]);
  }

  function updateActiveClassroom(update) {
    setClassrooms((currentClassrooms) =>
      currentClassrooms.map((classroom) =>
        classroom.id === activeClassroomId ? update(classroom) : classroom,
      ),
    );
  }

  function addCohortStudent(student) {
    updateActiveClassroom((classroom) => ({
      ...classroom,
      students: [...classroom.students, student],
      groups: classroom.groups.includes(student.group)
        ? classroom.groups
        : [...classroom.groups, student.group],
      rosterConfirmed: false,
    }));
  }

  function addCohortGroup(groupName) {
    const trimmedName = groupName.trim();
    if (!trimmedName) return false;
    if (
      activeClassroom.groups.some(
        (group) => group.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      return false;
    }

    updateActiveClassroom((classroom) => ({
      ...classroom,
      groups: [...classroom.groups, trimmedName],
      rosterConfirmed: false,
    }));
    return true;
  }

  function addInstructorCase(caseData) {
    updateActiveClassroom((classroom) => ({
      ...classroom,
      cases: [
        ...classroom.cases,
        { ...caseData, id: `CASE-${classroom.cases.length + 1}` },
      ],
    }));
  }

  function updateInstructorCase(caseId, updates) {
    updateActiveClassroom((classroom) => ({
      ...classroom,
      cases: classroom.cases.map((caseItem) =>
        caseItem.id === caseId ? { ...caseItem, ...updates } : caseItem,
      ),
    }));
  }

  function setRosterConfirmed(confirmed) {
    updateActiveClassroom((classroom) => ({
      ...classroom,
      rosterConfirmed: confirmed,
    }));
  }

  function addClassroom(classroomName) {
    const name = classroomName.trim();
    if (
      !name ||
      classrooms.some(
        (classroom) => classroom.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      return false;
    }

    const classroom = {
      id: `classroom-${Date.now()}`,
      name,
      students: [],
      groups: [],
      cases: [],
      rosterConfirmed: false,
    };
    setClassrooms((currentClassrooms) => [...currentClassrooms, classroom]);
    setActiveClassroomId(classroom.id);
    return true;
  }

  function updateCaseStatus(userId, caseId, newStatus) {
    setStudentCases((previousCases) => ({
      ...previousCases,
      [userId]: (previousCases[userId] || []).map((patientCase) =>
        patientCase.id === caseId
          ? { ...patientCase, encounterStatus: newStatus }
          : patientCase,
      ),
    }));
  }

  function saveStudentNote(caseId, note) {
    setStudentNotes((previousNotes) => ({ ...previousNotes, [caseId]: note }));
  }

  function updateNoteStatus(userId, caseId, newStatus) {
    setStudentCases((previousCases) => ({
      ...previousCases,
      [userId]: (previousCases[userId] || []).map((patientCase) =>
        patientCase.id === caseId
          ? { ...patientCase, noteStatus: newStatus }
          : patientCase,
      ),
    }));
  }

  function saveStudentOrders(caseId, orders) {
    setStudentOrders((previousOrders) => ({
      ...previousOrders,
      [caseId]: orders,
    }));
  }

  function submitStudentWork(userId, caseId, signatureName) {
  setStudentSubmissions((previousSubmissions) => ({
    ...previousSubmissions,
    [caseId]: {
      status: "Pending Review",
      submittedBy: userId,
      signatureName,
      submittedAt: new Date().toISOString(),
    },
  }));

  updateNoteStatus(userId, caseId, "Pending Review");
  }

  function handleLogin(authenticatedUser) {
    sessionStorage.setItem(sessionKey, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  }

  function handleLogout() {
    sessionStorage.removeItem(sessionKey);
    setUser(null);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pageSetsByRole = {
    Instructor: {
      overview: InstructorDashboardPage,
      cohorts: InstructorCohortsPage,
      cases: InstructorCasesPage,
      expectations: InstructorExpectationsPage,
      monitoring: InstructorMonitoringPage,
      review: InstructorReviewPage,
      feedback: InstructorFeedbackPage,
      oversight: InstructorOversightPage,
      closeout: InstructorCloseoutPage,
      settings: SettingsPage,
    },
    Patient: {
      overview: PatientDashboardPage,
      careTeam: CareTeamPage,
      appointments: PatientAppointmentsPage,
      insights: HealthInsightsPage,
      settings: SettingsPage,
    },
    Student: {
      overview: StudentDashboardPage,
      caseDetail: StudentCaseDetailPage,
      noteForm: StudentNoteFormPage,
      orderEntry: StudentOrderEntryPage,
      settings: SettingsPage,
    },
  };

  const navigationByRole = {
    Instructor: instructorNavigation,
    Patient: patientNavigation,
    Student: studentNavigation,
  };

  const pages = pageSetsByRole[user.role] || pageSetsByRole.Patient;
  const ActivePage = pages[activePage] || pages.overview;

  return (
    <AppRouter
      onLogin={handleLogin}
      onLogout={handleLogout}
      pageProps={pageProps}
      user={user}
    >
      <ActivePage
        user={user}
        patients={patients}
        addPatient={addPatient}
        onNavigate={setActivePage}
        selectedPatientId={selectedPatientId}
        setSelectedPatientId={setSelectedPatientId}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        studentCases={studentCases}
        updateCaseStatus={updateCaseStatus}
        studentNotes={studentNotes}
        saveStudentNote={saveStudentNote}
        updateNoteStatus={updateNoteStatus}
        studentOrders={studentOrders}
        saveStudentOrders={saveStudentOrders}
        cohortStudents={cohortStudents}
        cohortGroups={cohortGroups}
        classrooms={classrooms}
        activeClassroom={activeClassroom}
        setActiveClassroomId={setActiveClassroomId}
        addClassroom={addClassroom}
        addCohortStudent={addCohortStudent}
        addCohortGroup={addCohortGroup}
        instructorCases={instructorCases}
        addInstructorCase={addInstructorCase}
        updateInstructorCase={updateInstructorCase}
        rosterConfirmed={rosterConfirmed}
        setRosterConfirmed={setRosterConfirmed}
      />
    </DashboardLayout>
  );
}

export default App;
