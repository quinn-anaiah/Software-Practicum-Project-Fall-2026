import { useState } from "react";

const noteTemplates = {
  soap: {
    name: "SOAP Note",
    fields: [
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
    ],
  },
};

function StudentNoteFormPage({
  user,
  selectedCaseId,
  onNavigate,
  studentCases,
  studentNotes,
  saveStudentNote,
  updateNoteStatus,
}) {
  const cases = studentCases[user.id] || [];

  const patientCase = cases.find(
    (c) => c.id === selectedCaseId
  );

  const existingNote = studentNotes[selectedCaseId];

  const templateType = "soap";
  const template = noteTemplates[templateType];

  const [formData, setFormData] = useState(
    existingNote?.formData || {}
  );

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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function handleSaveDraft() {
    saveStudentNote(patientCase.id, {
      templateType,
      formData,
    });

    updateNoteStatus(
      user.id,
      patientCase.id,
      "In progress"
    );

    onNavigate("caseDetail");
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Clinical Note · {patientCase.id}
          </p>

          <h1>{patientCase.patientName}</h1>

          <p>{patientCase.chiefComplaint}</p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("caseDetail")}
        >
          Back to case
        </button>
      </section>

      <section className="panel data-panel">
        <div className="note-patient-summary">
          <h2>Patient Information</h2>

          <p>
            <strong>Age:</strong>{" "}
            {patientCase.patientAge}
          </p>

          <p>
            <strong>Sex:</strong>{" "}
            {patientCase.patientSex}
          </p>

          <p>
            <strong>Chief complaint:</strong>{" "}
            {patientCase.chiefComplaint}
          </p>

          <p>
            <strong>History:</strong>{" "}
            {patientCase.history}
          </p>

          <p>
            <strong>Current medications:</strong>
          </p>

          <ul>
            {patientCase.medications.map((med) => (
              <li key={med}>{med}</li>
            ))}
          </ul>

          <p>
            <strong>Results:</strong>{" "}
            {patientCase.results}
          </p>
        </div>

        <form
          className="note-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <h2>{template.name}</h2>

          {template.fields.map((field) => (
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
                value={formData[field.name] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onNavigate("caseDetail")}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StudentNoteFormPage;