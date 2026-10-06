export async function fetchRoles() {
  const response = await fetch("/api/roles");
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Unable to load roles from the API.");
  }

  return payload;
}

export async function registerUser(registrationData) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Unable to create your account.");
  }

  return payload;
}

export async function completePasswordSetup(passwordSetup) {
  const response = await fetch("/api/auth/complete-password-setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordSetup),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to set your password.");
  return payload;
}

export async function loginUser(credentials) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Unable to sign in.");
  }

  return payload;
}

export async function fetchCurrentUser(accessToken) {
  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Unable to restore your session.");
  }

  return payload;
}

export async function fetchAdminUsers(query = "") {
  const accessToken = sessionStorage.getItem("careflow-access-token");
  const search = new URLSearchParams();
  if (query) search.set("query", query);

  const response = await fetch(`/api/admin/users?${search.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken || ""}` },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Unable to load the user directory.");
  }

  return payload;
}

function getAdminHeaders() {
  const accessToken = sessionStorage.getItem("careflow-access-token");
  return {
    Authorization: `Bearer ${accessToken || ""}`,
    "Content-Type": "application/json",
  };
}

async function adminRequest(path, options = {}) {
  const response = await fetch(`/api/admin${path}`, {
    ...options,
    headers: { ...getAdminHeaders(), ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to complete this admin action.");
  return payload;
}

export function fetchAdminAccessOptions() {
  return adminRequest("/access-options");
}

export function inviteAdminUser(account) {
  return adminRequest("/users/invite", {
    method: "POST",
    body: JSON.stringify(account),
  });
}

export function updateAdminUserAccess(userId, access) {
  return adminRequest(`/users/${userId}/access`, {
    method: "PATCH",
    body: JSON.stringify(access),
  });
}

export function requestAdminPasswordReset(userId) {
  return adminRequest(`/users/${userId}/password-reset`, { method: "POST" });
}

export function updateAdminUserStatus(userId, isActive) {
  return adminRequest(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function fetchAdminAuditLog() {
  return adminRequest("/audit-log");
}

async function instructorRequest(path, options = {}) {
  const response = await fetch(`/api/instructor${path}`, {
    ...options,
    headers: { ...getAdminHeaders(), ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Unable to load instructor data.");
  return payload;
}

export function fetchInstructorDashboard() {
  return instructorRequest("/dashboard");
}

export function fetchInstructorClassrooms() {
  return instructorRequest("/classrooms");
}

export function fetchInstructorClassroom(classroomId) {
  return instructorRequest(`/classrooms/${classroomId}`);
}

export function fetchEligibleInstructorStudents() {
  return instructorRequest("/eligible-students");
}

export function createInstructorClassroom(classroom) {
  return instructorRequest("/classrooms", {
    method: "POST",
    body: JSON.stringify(classroom),
  });
}

export function createInstructorClassroomGroup(classroomId, group) {
  return instructorRequest(`/classrooms/${classroomId}/groups`, {
    method: "POST",
    body: JSON.stringify(group),
  });
}

export async function fetchAdminPatients() {
  //Get the login token from session storage
  const accessToken = sessionStorage.getItem("careflow-access-token");
  //Ask the Express API for the list of patients, 
  // passing the token in the Authorization header
  const response = await fetch("/api/admin/patients", {
    headers: { Authorization: `Bearer ${accessToken || ""}` },
  });
  const patients = await response.json();

  if (!response.ok) {
    throw new Error(patients.message || "Unable to load the patient directory.");
  }

  return patients;
}

export async function fetchAdminPatient(patientId) {
  const accessToken = sessionStorage.getItem("careflow-access-token");
  const response = await fetch(`/api/admin/patients/${encodeURIComponent(patientId)}`, {
    headers: { Authorization: `Bearer ${accessToken || ""}` },
  });
  const patient = await response.json();

  if (!response.ok) {
    throw new Error(patient.message || "Unable to load the patient record.");
  }

  return patient;
}
export async function fetchStudentCases() {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch(
    "/api/student/cases",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to load cases.",
    );
  }

  return payload;
}

export async function saveStudentNote(note) {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch("/api/student/notes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to save note.",
    );
  }

  return payload;
}

export async function fetchStudentNote(assignmentId) {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch(
    `/api/student/notes/${assignmentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to load note.",
    );
  }

  return payload;
}

export async function updateStudentCaseStatus(
  assignmentId,
  encounterStatus,
) {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch(
    `/api/student/cases/${assignmentId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        encounterStatus,
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message ||
        "Unable to update encounter status.",
    );
  }

  return payload;
}

export async function saveStudentOrders(
  assignmentId,
  orders,
) {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch("/api/student/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignmentId,
      orders,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to save orders.",
    );
  }

  return payload;
}

export async function fetchStudentOrders(assignmentId) {
  const accessToken = sessionStorage.getItem(
    "careflow-access-token",
  );

  if (!accessToken) {
    throw new Error(
      "No active session. Please sign in again.",
    );
  }

  const response = await fetch(
    `/api/student/orders/${assignmentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to load orders.",
    );
  }

  return payload;

}
