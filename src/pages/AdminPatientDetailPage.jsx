import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAdminPatient } from "../lib/api";

function AdminPatientDetailPage() {
  // Lets us return to the Patients page.
  const navigate = useNavigate();

  // Reads ?id= from the URL.
  const [searchParams] = useSearchParams();

  const patientId = searchParams.get("id");

  // Stores the patient returned from Supabase.
  const [patient, setPatient] = useState(null);

  // Stores loading state.
  const [isLoading, setIsLoading] = useState(true);

  // Stores an error message if something goes wrong.
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      // Make sure a patient ID was included in the URL.
      if (!patientId) {
        setError("No patient was selected.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        // Ask the backend for this patient's information.
        const patientData = await fetchAdminPatient(patientId);

        // Save the patient information into React state.
        setPatient(patientData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load patient record.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  // Formats database dates into an easier-to-read format.
  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    return new Date(dateValue).toLocaleDateString();
  }

  // Display while patient information is loading.
  if (isLoading) {
    return (
      <div className="dashboard-page content-page">
        <p>Loading patient record...</p>
      </div>
    );
  }

  // Display if something goes wrong.
  if (error) {
    return (
      <div className="dashboard-page content-page">
        <section className="page-heading">
          <div>
            <p className="section-label">Patient record</p>

            <h1>Unable to load patient</h1>

            <p>{error}</p>
          </div>
        </section>

        <button
          className="outline-button"
          type="button"
          onClick={() => navigate("/admin/patients")}
        >
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      {/* Page heading */}
      <section className="page-heading">
        <div>
          <p className="section-label">Patient record</p>

          <h1>{patient.name}</h1>

          <p>
            View the account and patient information associated with this
            Careflow patient.
          </p>
        </div>

        <button
          className="outline-button"
          type="button"
          onClick={() => navigate("/admin/patients")}
        >
          Back to Patients
        </button>
      </section>

      {/* Account information from profiles and Supabase Auth */}
      <section className="panel" style={{ padding: "24px" }}>
        <p className="section-label">Account information</p>

        <h2>Patient account</h2>

        <p>
          <strong>First name:</strong>{" "}
          {patient.firstName || "Not available"}
        </p>

        <p>
          <strong>Last name:</strong>{" "}
          {patient.lastName || "Not available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {patient.email || "Not available"}
        </p>

        <p>
          <strong>Careflow ID:</strong>{" "}
          {patient.careflowId || "Not assigned"}
        </p>

        <p>
          <strong>Account created:</strong>{" "}
          {formatDate(patient.createdAt)}
        </p>

        <p>
          <strong>Email confirmed:</strong>{" "}
          {patient.emailConfirmed ? "Yes" : "No"}
        </p>

        <p>
          <strong>Account status:</strong>{" "}
          {patient.isActive ? "Active" : "Inactive"}
        </p>
      </section>

      {/* Patient-specific information from patient_records */}
      <section
        className="panel"
        style={{
          padding: "24px",
          marginTop: "20px",
        }}
      >
        <p className="section-label">Patient information</p>

        <h2>Demographics</h2>

        <p>
          <strong>Date of birth:</strong>{" "}
          {formatDate(patient.dateOfBirth)}
        </p>

        <p>
          <strong>Sex:</strong>{" "}
          {patient.sex || "Not available"}
        </p>

        <p>
          <strong>Phone:</strong>{" "}
          {patient.phone || "Not available"}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {patient.address || "Not available"}
        </p>

        <p>
          <strong>Primary provider:</strong>{" "}
          {patient.primaryProvider || "Not assigned"}
        </p>
      </section>
    </div>
  );
}

export default AdminPatientDetailPage;