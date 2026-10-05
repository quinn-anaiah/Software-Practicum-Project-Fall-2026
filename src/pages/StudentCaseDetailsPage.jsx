import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import {
  fetchStudentCases,
  fetchStudentNote,
} from "../lib/api";

const statusOrder = [
  "Scheduled",
  "Checked in",
  "Roomed",
  "In progress",
  "Checked out",
];

const statusButtonLabels = {
  Scheduled: "Check In",
  "Checked in": "Mark as Roomed",
  Roomed: "Start Encounter",
  "In progress": "Check Out",
};

function StudentCaseDetailPage({
  selectedCaseId,
  onNavigate,
  updateCaseStatus,
  studentNotes = {},
  studentOrders = {},
  studentSubmissions = {},
}) {
  const [searchParams] = useSearchParams();
  const [patientCase, setPatientCase] = useState(null);
  const [savedNote, setSavedNote] = useState(null);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState("");

  const caseIdFromUrl = searchParams.get("id");
  const activeCaseId =
    caseIdFromUrl !== null ? Number(caseIdFromUrl) : selectedCaseId;

  useEffect(() => {
    let isCurrent = true;

    async function loadCase() {
      if (activeCaseId === null || activeCaseId === undefined) {
        setCasesLoading(false);
        return;
      }

      try {
        setCasesLoading(true);
        setCasesError("");

        const cases = await fetchStudentCases();

        if (!isCurrent) return;

        const selectedCase = cases.find(
          (currentCase) =>
            String(currentCase.id) === String(activeCaseId),
        );

        setPatientCase(selectedCase ?? null);
        if (selectedCase?.assignment_id) {
          const note = await fetchStudentNote(
            selectedCase.assignment_id,
          );

          if (!isCurrent) return;

          setSavedNote(note);
        }
      } catch (error) {
        if (isCurrent) {
          setCasesError(error.message);
        }
      } finally {
        if (isCurrent) {
          setCasesLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      isCurrent = false;
    };
  }, [activeCaseId]);

  if (casesLoading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading case...</p>
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{casesError}</p>
      </div>
    );
  }

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        <p>No case selected. Choose a case from your dashboard.</p>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          Back to my cases
        </button>
      </div>
    );
  }

  const orders = studentOrders[patientCase.id] ?? [];
  const submission = studentSubmissions[patientCase.id];
  const medications = patientCase.medications ?? [];
  const allergies = patientCase.allergies ?? [];

  const encounterStatus =
    patientCase.encounterStatus ??
    patientCase.starting_encounter_status;

  const noteStatus = savedNote
    ? "In progress"
    : "Not started";

  const encounterInProgress = encounterStatus === "In progress";
  const isSubmitted = submission?.status === "Pending Review";
  const readyToSubmit =
    Boolean(savedNote) && orders.length > 0;
  const statusButtonLabel = statusButtonLabels[encounterStatus];

  function advanceStatus() {
    const currentIndex = statusOrder.indexOf(encounterStatus);

    if (
      currentIndex < 0 ||
      currentIndex >= statusOrder.length - 1
    ) {
      return;
    }

    const nextStatus = statusOrder[currentIndex + 1];

    if (updateCaseStatus) {
      updateCaseStatus(patientCase.id, nextStatus);
    }

    setPatientCase((currentCase) => ({
      ...currentCase,
      encounterStatus: nextStatus,
    }));
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Case · {patientCase.id}</p>
          <h1>{patientCase.patient_name}</h1>
          <p>{patientCase.title || "Clinical case"}</p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          <Icon name="arrow" size={16} /> Back
        </button>
      </section>

      <section className="panel data-panel">
        <dl className="detail-form-grid">
          <div className="detail-field">
            <dt>Age</dt>
            <dd>{patientCase.patient_age ?? "Not provided"}</dd>
          </div>

          <div className="detail-field">
            <dt>Sex</dt>
            <dd>{patientCase.patient_sex || "Not provided"}</dd>
          </div>

          <div className="detail-field detail-field--wide">
            <dt>Chief complaint</dt>
            <dd>{patientCase.chief_complaint || "Not provided"}</dd>
          </div>

          <div className="detail-field detail-field--wide">
            <dt>History</dt>
            <dd>{patientCase.history || "Not provided"}</dd>
          </div>

          <div className="detail-field detail-field--wide">
            <dt>Current medications</dt>
            <dd>
              {medications.length > 0 ? (
                <ul>
                  {medications.map((medication, index) => (
                    <li key={`${medication}-${index}`}>
                      {medication}
                    </li>
                  ))}
                </ul>
              ) : (
                "No medications listed"
              )}
            </dd>
          </div>

          <div className="detail-field detail-field--wide">
            <dt>Allergies</dt>
            <dd>
              {allergies.length > 0 ? (
                <ul>
                  {allergies.map((allergy, index) => (
                    <li key={`${allergy}-${index}`}>
                      {allergy}
                    </li>
                  ))}
                </ul>
              ) : (
                "No allergies listed"
              )}
            </dd>
          </div>

          <div className="detail-field detail-field--wide">
            <dt>Results</dt>
            <dd>{patientCase.results || "No results available"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel data-panel">
        <dl className="detail-form-grid">
          <div className="detail-field">
            <dt>Encounter status</dt>

            <dd className="status-action">
              <span>{encounterStatus}</span>

              {statusButtonLabel && (
                <button
                  className="primary-button"
                  type="button"
                  onClick={advanceStatus}
                >
                  {statusButtonLabel}
                </button>
              )}
            </dd>
          </div>

          <div className="detail-field">
            <dt>Note status</dt>

            <dd className="status-action">
              <span>{noteStatus}</span>

              <button
                className="primary-button"
                type="button"
                disabled={!encounterInProgress}
                onClick={() =>
                  onNavigate("noteForm", {
                    caseId: patientCase.id,
                  })
                }
              >
                {noteStatus === "Not started"
                  ? "Start Note"
                  : "Continue Note"}
              </button>
            </dd>
          </div>

          <div className="detail-field">
            <dt>Orders</dt>

            <dd className="status-action">
              <span>
                {orders.length === 0
                  ? "No orders"
                  : `${orders.length} draft ${
                      orders.length === 1 ? "order" : "orders"
                    }`}
              </span>

              <button
                className="primary-button"
                type="button"
                disabled={!encounterInProgress}
                onClick={() =>
                  onNavigate("orderEntry", {
                    caseId: patientCase.id,
                  })
                }
              >
                {orders.length === 0
                  ? "Add Orders"
                  : "Manage Orders"}
              </button>
            </dd>
          </div>

          <div className="detail-field">
            <dt>Submission</dt>

            <dd className="status-action">
              <span>
                {submission?.status ||
                  (readyToSubmit
                    ? "Ready for review"
                    : "Not ready")}
              </span>

              <button
                className="primary-button"
                type="button"
                disabled={
                  !encounterInProgress ||
                  !readyToSubmit ||
                  isSubmitted
                }
                onClick={() => onNavigate("submission")}
              >
                {isSubmitted
                  ? "Submitted"
                  : "Submit for Review"}
              </button>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default StudentCaseDetailPage;