import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { fetchAdminPatients } from "../lib/api";

function AdminPatientsPage() {
  const navigate = useNavigate();

  // Stores all Patient accounts returned from Supabase.
  const [patients, setPatients] = useState([]);

  // Stores what the Admin types into the search box.
  const [searchText, setSearchText] = useState("");

  // Helps us show a loading message while waiting for Supabase.
  const [isLoading, setIsLoading] = useState(true);

  // Stores an error message if the API request fails.
  const [error, setError] = useState("");

  // Load the patients when this page first opens.
  useEffect(() => {
    async function loadPatients() {
      try {
        setIsLoading(true);
        setError("");

        const patientData = await fetchAdminPatients();

        setPatients(patientData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load patients.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPatients();
  }, []);

  // Search through the patient list.
  function getFilteredPatients() {
    const matchingPatients = [];

    const lowerSearchText = searchText.toLowerCase();

    for (const patient of patients) {
      const patientName = (patient.name || "").toLowerCase();

      const patientEmail = (patient.email || "").toLowerCase();

      const careflowId = (patient.careflowId || "").toLowerCase();

      const patientId = (patient.id || "").toLowerCase();

      const nameMatches = patientName.includes(lowerSearchText);

      const emailMatches = patientEmail.includes(lowerSearchText);

      const careflowIdMatches = careflowId.includes(lowerSearchText);

      const idMatches = patientId.includes(lowerSearchText);

      if (
        nameMatches ||
        emailMatches ||
        careflowIdMatches ||
        idMatches
      ) {
        matchingPatients.push(patient);
      }
    }

    return matchingPatients;
  }

  const filteredPatients = getFilteredPatients();

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function clearSearch() {
    setSearchText("");
  }

  function getInitials(name) {
    if (!name) {
      return "PT";
    }

    const parts = name.split(" ");

    const firstInitial = parts[0]?.charAt(0) || "";
    const lastInitial = parts[1]?.charAt(0) || "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString();
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Patient directory</p>

          <h1>Patients</h1>

          <p>
            Search Patient accounts currently stored in Careflow.
          </p>
        </div>
      </section>

      <section className="panel data-panel">
        <div className="data-panel__toolbar">
          <strong>
            {filteredPatients.length}{" "}
            {filteredPatients.length === 1 ? "patient" : "patients"}{" "}
          </strong>

          <label className="table-search">
            <Icon name="search" size={16} />

            <input
              placeholder="Search patients"
              type="search"
              value={searchText}
              onChange={handleSearchChange}
            />
          </label>

          {searchText !== "" && (
            <button
              className="outline-button"
              type="button"
              onClick={clearSearch}
            >
              Clear search
            </button>
          )}
        </div>

        {isLoading && (
          <p style={{ padding: "22px" }}>
            Loading patients...
          </p>
        )}

        {error && (
          <p style={{ padding: "22px" }}>
            {error}
          </p>
        )}

        {!isLoading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Careflow ID</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      No patients found.
                    </td>
                  </tr>
                )}

                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="patient-avatar patient-avatar--blue">
                        {getInitials(patient.name)}
                      </span>

                      <div>
                        <strong>{patient.name || "Unnamed patient"}</strong>

                        <small>
                          Patient account
                        </small>
                      </div>
                    </td>

                    <td>
                      {patient.careflowId || "Not assigned"}
                    </td>

                    <td>
                      {patient.email || "Not available"}
                    </td>

                    <td>
                      {formatDate(patient.createdAt)}
                    </td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        aria-label={`View details for ${patient.name || "Unnamed patient"}`}
                        onClick={() => navigate(`/admin/patient?id=${patient.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPatientsPage;