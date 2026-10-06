import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon";
import {
  fetchStudentCases,
  fetchStudentNote,
  saveStudentNote,
} from "../lib/api";

const noteFields = [
  {
    name: "subjective",
    label: "Subjective",
    description:
      "Document patient-reported symptoms, concerns, and relevant history.",
    placeholder: "Enter subjective findings...",
  },
  {
    name: "objective",
    label: "Objective",
    description:
      "Document measurable findings such as vitals, examination findings, labs, and other results.",
    placeholder: "Enter objective findings...",
  },
  {
    name: "assessment",
    label: "Assessment",
    description:
      "Document your clinical assessment based on the available information.",
    placeholder: "Enter assessment...",
  },
  {
    name: "plan",
    label: "Plan",
    description:
      "Document proposed treatment, testing, follow-up, or other actions.",
    placeholder: "Enter plan...",
  },
];

function StudentNoteFormPage({ onNavigate }) {
  const [searchParams] = useSearchParams();

  const [patientCase, setPatientCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const caseId = searchParams.get("id");

  useEffect(() => {
    let isCurrent = true;

    async function loadCase() {
      if (!caseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const cases = await fetchStudentCases();

        if (!isCurrent) return;

        const selectedCase = cases.find(
          (currentCase) =>
            String(currentCase.id) === String(caseId),
        );

        setPatientCase(selectedCase ?? null);
        if (selectedCase?.assignment_id) {
          const savedNote = await fetchStudentNote(
            selectedCase.assignment_id,
          );

          if (savedNote?.content) {
            setFormData({
              subjective: savedNote.content.subjective || "",
              objective: savedNote.content.objective || "",
              assessment: savedNote.content.assessment || "",
              plan: savedNote.content.plan || "",
            });
          }
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      isCurrent = false;
    };
  }, [caseId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSave() {
    try {
      setError("");

      await saveStudentNote({
        assignmentId: patientCase.assignment_id,
        content: formData,
      });

      onNavigate("caseDetail", {
        caseId: patientCase.id,
      });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function goBackToCase() {
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }

  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading case...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        <p>No case selected.</p>

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

  const medications = patientCase.medications ?? [];

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Clinical Note · {patientCase.id}
          </p>

          <h1>{patientCase.patient_name}</h1>

          <p>
            {patientCase.chief_complaint}
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={goBackToCase}
        >
          <Icon name="arrow" size={16} />
          Back to case
        </button>
      </section>

      <section className="panel data-panel">
        <div className="note-patient-summary">
          <h2>Patient Information</h2>

          <p>
            <strong>Age:</strong>{" "}
            {patientCase.patient_age ?? "Not provided"}
          </p>

          <p>
            <strong>Sex:</strong>{" "}
            {patientCase.patient_sex || "Not provided"}
          </p>

          <p>
            <strong>Chief complaint:</strong>{" "}
            {patientCase.chief_complaint || "Not provided"}
          </p>

          <p>
            <strong>History:</strong>{" "}
            {patientCase.history || "Not provided"}
          </p>

          <p>
            <strong>Current medications:</strong>
          </p>

          {medications.length > 0 ? (
            <ul>
              {medications.map((medication, index) => (
                <li key={`${medication}-${index}`}>
                  {medication}
                </li>
              ))}
            </ul>
          ) : (
            <p>No medications listed.</p>
          )}

          <p>
            <strong>Results:</strong>{" "}
            {patientCase.results || "No results available"}
          </p>
        </div>
      </section>

      <section className="panel data-panel">
        <form
          className="note-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2>SOAP Note</h2>

          {noteFields.map((field) => (
            <div
              className="note-field"
              key={field.name}
            >
              <label htmlFor={field.name}>
                {field.label}
              </label>

              <p>{field.description}</p>

              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={goBackToCase}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={handleSave}
            >
              Save Note
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StudentNoteFormPage;