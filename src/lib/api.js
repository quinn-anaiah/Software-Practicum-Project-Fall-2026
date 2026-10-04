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
