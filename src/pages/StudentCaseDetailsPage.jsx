
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import {
  fetchStudentCases,
  fetchStudentNote,
  updateStudentCaseStatus,
} from "../lib/api";

const statusOrder = [
  "Scheduled",
  "Checked in",
  "Roomed",
  "In progress",
  "Checked out",
];

const statusLabels = {
  Scheduled: "Check In",
  "Checked in": "Mark as Roomed",
  Roomed: "Start Encounter",
  "In progress": "Check Out",
};

function StudentCaseDetailPage({ selectedCaseId, onNavigate }) {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("id") ?? selectedCaseId;

  const [activeTab, setActiveTab] = useState("case");
  const [patientCase, setPatientCase] = useState(null);
  const [savedNote, setSavedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadCase() {
      setLoading(true);
      setError("");
      setPatientCase(null);
      setSavedNote(null);
      setActiveTab("case");

      try {
        if (caseId == null) return;

        const cases = await fetchStudentCases();
        if (!isCurrent) return;

        const selected = cases.find(
          (item) => String(item.id) === String(caseId)
        );

        setPatientCase(selected ?? null);

        if (!selected?.assignment_id) return;

        const note = await fetchStudentNote(
          selected.assignment_id
        );

        if (!isCurrent) return;

        setSavedNote(note);
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadCase();

    return () => {
      isCurrent = false;
    };
  }, [caseId]);

  function navigateTo(page) {
    onNavigate(page, { caseId: patientCase.id });
  }

  async function advanceStatus() {
    const currentStatus =
      patientCase.encounter_status ??
      patientCase.starting_encounter_status;

    const index = statusOrder.indexOf(currentStatus);

    if (
      updatingStatus ||
      index < 0 ||
      index >= statusOrder.length - 1 ||
      currentStatus === "In progress"
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const nextStatus = statusOrder[index + 1];

      await updateStudentCaseStatus(
        patientCase.assignment_id,
        nextStatus
      );

      setPatientCase((current) => ({
        ...current,
        encounter_status: nextStatus,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading case...</p>
      </div>
    );
  }

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        {error && <p role="alert">{error}</p>}
        <p>Case not found.</p>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          Back to My Cases
        </button>
      </div>
    );
  }

  const encounterStatus =
    patientCase.encounter_status ??
    patientCase.starting_encounter_status ??
    "Scheduled";

  const encounterInProgress =
    encounterStatus === "In progress";

  const noteStatus = savedNote?.status || "Not started";
  const hasNote = Boolean(savedNote);

  const readyForReview = encounterInProgress && hasNote;

  const details = [
    ["Age", patientCase.patient_age ?? "Not provided"],
    ["Sex", patientCase.patient_sex || "Not provided"],
    ["Chief Complaint", patientCase.chief_complaint || "Not provided"],
    ["Medical History", patientCase.history || "Not provided"],
    ["Current Medications", patientCase.medications],
    ["Allergies", patientCase.allergies],
    ["Results", patientCase.results || "No results available"],
  ];

  function renderDetail(value) {
    if (Array.isArray(value)) {
      return value.length ? (
        <ul>
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        "None listed"
      );
    }

    return value ?? "Not provided";
  }

  return (
    <div className="dashboard-page content-page">
      {/* PATIENT HEADER */}
      <section className="page-heading case-header">
        <div>
          <p className="section-label">
            Student Encounter · Case {patientCase.id}
          </p>

          <h1>{patientCase.patient_name}</h1>

          <p>
            {patientCase.patient_age ?? "Age not provided"} years
            {" · "}
            {patientCase.patient_sex || "Sex not provided"}
            {" · "}
            {patientCase.title}
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          <Icon name="arrow" size={16} />
          Back to My Cases
        </button>
      </section>

      {/* TABS AND ENCOUNTER STATUS */}
      <div className="case-tabs-bar">
        <nav className="case-tabs" aria-label="Case sections">
          {[
            ["case", "Case Information"],
            ["notes", "Notes"],
            ["review", "Review & Submit"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`case-tab ${
                activeTab === id ? "case-tab--active" : ""
              }`}
              onClick={() => setActiveTab(id)}
              aria-current={
                activeTab === id ? "page" : undefined
              }
            >
              {label}
            </button>
          ))}
        </nav>
          <div className="case-encounter-status">
            <span className="encounter-status-label">
              Encounter Status:
            </span>

            <span className="status-badge">
              {encounterStatus}
            </span>

          {statusLabels[encounterStatus] && (
            <button
              className="primary-button"
              type="button"
              onClick={advanceStatus}
              disabled={updatingStatus || encounterInProgress}
            >
              {updatingStatus
                ? "Updating..."
                : statusLabels[encounterStatus]}
            </button>
          )}
        </div>
      </div>

      {error && <p role="alert">{error}</p>}

      {/* CASE INFORMATION */}
      {activeTab === "case" && (
        <section className="panel data-panel case-section">
          <h2>Case Information</h2>

          <dl className="detail-form-grid">
            {details.map(([label, value], index) => (
              <div
                className={`detail-field ${
                  index > 1 ? "detail-field--wide" : ""
                }`}
                key={label}
              >
                <dt>{label}</dt>
                <dd>{renderDetail(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* NOTES */}
      {activeTab === "notes" && (
        <section className="panel data-panel case-section">
          <div className="case-section-heading">
            <div>
              <h2>Clinical Notes</h2>
              <p>
                {hasNote
                  ? "You have a saved clinical note. Continue editing where you left off."
                  : "No clinical note has been started for this encounter."}
              </p>
            </div>

            <span className="status-badge">
              {noteStatus}
            </span>
          </div>

          <dl className="detail-form-grid">
            <div className="detail-field">
              <dt>Note Type</dt>
              <dd>SOAP Note</dd>
            </div>

            <div className="detail-field">
              <dt>Status</dt>
              <dd>{noteStatus}</dd>
            </div>
          </dl>

          <div className="form-actions">
            <button
              className="primary-button"
              type="button"
              disabled={
                !encounterInProgress ||
                noteStatus === "Signed" ||
                noteStatus === "Approved"
              }
              onClick={() => navigateTo("noteForm")}
            >
              {hasNote ? "Continue Note" : "Start Note"}
            </button>
          </div>

          {!encounterInProgress && (
            <p className="case-help-text">
              Start the encounter before editing clinical notes.
            </p>
          )}
        </section>
      )}

      {/* REVIEW & SUBMIT */}
      {activeTab === "review" && (
        <section className="panel data-panel case-section">
          <div className="case-section-heading">
            <div>
              <h2>Review & Submit</h2>
              <p>
                Review your saved SOAP note before
                submitting it for instructor review.
              </p>
            </div>
          </div>

          <dl className="detail-form-grid">
            <div className="detail-field">
              <dt>SOAP Note</dt>
              <dd>{noteStatus}</dd>
            </div>
          </dl>

          <div className="form-actions">
            <button
              className="primary-button"
              type="button"
              disabled={!readyForReview}
              onClick={() => navigateTo("submission")}
            >
              Review Documentation
            </button>
          </div>

          {!readyForReview && (
            <p className="case-help-text">
              Start the encounter and save a SOAP note
              before reviewing.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

export default StudentCaseDetailPage;
