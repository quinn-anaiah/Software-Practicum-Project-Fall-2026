import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchStudentCases } from "../lib/api";

const TEMPLATES = {
  pharmacy_soap: {
    label: "Pharmacy SOAP (Ambulatory Care)",
    sections: [
      {
        title: "S — Subjective",
        fields: [
          ["chiefComplaint", "Chief Complaint"],
          ["hpi", "History of Present Illness"],
          ["medicationHistory", "Medication History"],
          ["medicationAdherence", "Medication Adherence"],
          ["adverseEffects", "Adverse Drug Reactions / Side Effects"],
          ["homeMonitoring", "Home Monitoring"],
          ["lifestyle", "Lifestyle and Relevant History"],
          ["reviewOfSystems", "Review of Systems"],
        ],
      },
      {
        title: "O — Objective",
        fields: [
          ["vitals", "Vital Signs and Measurements"],
          ["labs", "Laboratory Results"],
          ["medications", "Current Medications"],
          ["allergies", "Allergies"],
          ["physicalFindings", "Physical Findings"],
          ["diagnostics", "Diagnostic Results"],
        ],
      },
      {
        title: "A — Assessment",
        problems: true,
      },
      {
        title: "P — Plan",
        fields: [
          ["medicationChanges", "Medication Recommendations"],
          ["medicationRationale", "Medication Rationale"],
          ["counseling", "Patient Education and Counseling"],
          ["lifestylePlan", "Lifestyle Recommendations"],
          ["monitoring", "Laboratory and Clinical Monitoring"],
          ["followUp", "Follow-up"],
          ["referrals", "Referrals"],
        ],
      },
    ],
  },
  pharmacy_sbar: {
    label: "Pharmacy SBAR (Inpatient)",
    sections: [
      {
        title: "S — Situation",
        fields: [
          ["situation", "Current Situation / Reason for Communication"],
        ],
      },
      {
        title: "B — Background",
        fields: [
          ["background", "Relevant Patient Background"],
        ],
      },
      {
        title: "A — Assessment",
        fields: [
          ["assessment", "Clinical Assessment"],
        ],
      },
      {
        title: "R — Recommendation",
        fields: [
          ["recommendation", "Recommended Actions"],
        ],
      },
    ],
  },
};

const PROBLEM_FIELDS = [
  ["diagnosis", "Diagnosis / Clinical Problem"],
  ["icd10", "ICD-10 Code"],
  ["status", "Current Clinical Status"],
  ["evidence", "Supporting Evidence"],
  ["reasoning", "Clinical Reasoning"],
  ["goal", "Treatment Goal"],
];

const createProblem = () => ({
  id: crypto.randomUUID(),
  diagnosis: "",
  icd10: "",
  status: "",
  evidence: "",
  reasoning: "",
  goal: "",
});

export default function PharmacyNotesPage({ onNavigate, user }) {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("id");

  const [patientCase, setPatientCase] = useState(null);
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [noteType, setNoteType] = useState("pharmacy_soap");
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState({});
  const [problems, setProblems] = useState([createProblem()]);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storageKey =
    patientCase?.assignment_id != null
      ? `pharmacy-notes:${user?.id || "unknown"}:${patientCase.assignment_id}`
      : null;

  const selectedNote = notes.find((note) => note.id === selectedId);
  const readOnly = ["Pending Review", "Approved"].includes(
    selectedNote?.status
  );

  useEffect(() => {
    let active = true;

    async function loadCase() {
      setLoading(true);
      setError("");
      setPatientCase(null);

      try {
        if (!caseId) throw new Error("No case selected.");

        const cases = await fetchStudentCases();
        const selected = cases.find(
          (item) => String(item.id) === String(caseId)
        );

        if (!selected) throw new Error("Case not found.");

        if (active) setPatientCase(selected);
      } catch (err) {
        if (active) setError(err.message || "Unable to load case.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCase();

    return () => {
      active = false;
    };
  }, [caseId]);

  useEffect(() => {
    if (!storageKey) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );

      setNotes(
        Array.isArray(saved)
          ? saved.filter((note) => TEMPLATES[note.type])
          : []
      );
    } catch {
      setNotes([]);
    }

    setEditing(false);
    setSelectedId(null);
    setNoteTitle("");
    setContent({});
    setProblems([createProblem()]);
    setDirty(false);
  }, [storageKey]);

  function confirmDiscard() {
    return !dirty || window.confirm("Discard unsaved changes?");
  }

  function newNote() {
    if (!confirmDiscard()) return;

    setSelectedId(null);
    setNoteType("pharmacy_soap");
    setNoteTitle("");
    setContent({});
    setProblems([createProblem()]);
    setDirty(false);
    setEditing(true);
  }

  function openNote(note) {
    if (!confirmDiscard()) return;

    setSelectedId(note.id);
    setNoteType(note.type);
    setNoteTitle(note.title || "");
    setContent(note.content || {});
    setProblems(
      note.problems?.length ? note.problems : [createProblem()]
    );
    setDirty(false);
    setEditing(true);
  }

  function backToNotes() {
    if (!confirmDiscard()) return;

    setEditing(false);
    setSelectedId(null);
    setDirty(false);
  }

  function changeType(type) {
    if (!confirmDiscard()) return;

    setNoteType(type);
    setContent({});
    setProblems([createProblem()]);
    setDirty(false);
  }

  function updateField(field, value) {
    setContent((previous) => ({
      ...previous,
      [field]: value,
    }));
    setDirty(true);
  }

  function updateProblem(id, field, value) {
    setProblems((previous) =>
      previous.map((problem) =>
        problem.id === id
          ? { ...problem, [field]: value }
          : problem
      )
    );
    setDirty(true);
  }

  function addProblem() {
    setProblems((previous) => [...previous, createProblem()]);
    setDirty(true);
  }

  function removeProblem(id) {
    setProblems((previous) =>
      previous.filter((problem) => problem.id !== id)
    );
    setDirty(true);
  }

  function saveNote() {
    if (!storageKey || readOnly) return;

    const id = selectedId || crypto.randomUUID();
    const now = new Date().toISOString();

    const note = {
      id,
      type: noteType,
      title: noteTitle.trim() || TEMPLATES[noteType].label,
      content,
      problems: noteType === "pharmacy_soap" ? problems : [],
      status: selectedNote?.status || "Draft",
      createdAt: selectedNote?.createdAt || now,
      updatedAt: now,
    };

    const updated = [
      note,
      ...notes.filter((item) => item.id !== id),
    ];

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setNotes(updated);
      setSelectedId(null);
      setDirty(false);
      setEditing(false);
      setError("");
    } catch {
      setError("Unable to save note.");
    }
  }

  function deleteNote() {
    if (
      !selectedId ||
      readOnly ||
      !window.confirm("Delete this note?")
    ) {
      return;
    }

    const updated = notes.filter((note) => note.id !== selectedId);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setNotes(updated);
      setSelectedId(null);
      setDirty(false);
      setEditing(false);
      setError("");
    } catch {
      setError("Unable to delete note.");
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p>Loading notes...</p>
      </div>
    );
  }

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{error || "Case not found."}</p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigate?.("overview")}
        >
          Back to My Cases
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Student Documentation</p>
          <h1>Pharmacy Notes</h1>
          <p>
            {patientCase.patient_name} · {patientCase.title}
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            if (confirmDiscard()) {
              onNavigate?.("caseDetail", { caseId });
            }
          }}
        >
          Back to Case
        </button>
      </section>

      {error && <p role="alert">{error}</p>}

      {!editing ? (
        <section className="panel data-panel">
          <div className="case-section-heading">
            <h2>Existing Notes</h2>
            <button
              type="button"
              className="primary-button"
              onClick={newNote}
            >
              + New Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p>No notes created yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Note Type</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.title || "Untitled Note"}</td>
                      <td>{TEMPLATES[note.type]?.label}</td>
                      <td>
                        {note.updatedAt
                          ? new Date(note.updatedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td>
                        <span className="status-badge">
                          {note.status || "Draft"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => openNote(note)}
                        >
                          {["Pending Review", "Approved"].includes(
                            note.status
                          )
                            ? "View"
                            : "Continue"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <section className="panel data-panel">
          <div className="case-section-heading">
            <h2>
              {readOnly
                ? "View Note"
                : selectedId
                  ? "Edit Note"
                  : "New Note"}
            </h2>

            <button
              type="button"
              className="secondary-button"
              onClick={backToNotes}
            >
              Back to Notes
            </button>
          </div>

          <div className="detail-form-grid">
            <div className="detail-field">
              <label htmlFor="note-title">Note Title</label>
              <input
                id="note-title"
                type="text"
                value={noteTitle}
                disabled={readOnly}
                onChange={(event) => {
                  setNoteTitle(event.target.value);
                  setDirty(true);
                }}
                placeholder="Enter note title"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="note-type">Note Type</label>
              <select
                id="note-type"
                value={noteType}
                disabled={Boolean(selectedId)}
                onChange={(event) => changeType(event.target.value)}
              >
                {Object.entries(TEMPLATES).map(([value, template]) => (
                  <option key={value} value={value}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {TEMPLATES[noteType].sections.map((section) => (
            <section
              key={section.title}
              className="panel"
              style={{ padding: "1.5rem", marginTop: "1.5rem" }}
            >
              {section.problems ? (
                <>
                  <div className="case-section-heading">
                    <h3>{section.title}</h3>
                    {!readOnly && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={addProblem}
                      >
                        + Add Problem
                      </button>
                    )}
                  </div>

                  {problems.map((problem, index) => (
                    <div
                      key={problem.id}
                      className="panel"
                      style={{
                        padding: "1.25rem",
                        marginTop: "1rem",
                      }}
                    >
                      <div className="case-section-heading">
                        <h4>Problem {index + 1}</h4>

                        {!readOnly && problems.length > 1 && (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => removeProblem(problem.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="detail-form-grid">
                        {PROBLEM_FIELDS.map(([field, label]) => (
                          <div className="detail-field" key={field}>
                            <label htmlFor={`${problem.id}-${field}`}>
                              {label}
                            </label>

                            {["evidence", "reasoning"].includes(field) ? (
                              <textarea
                                id={`${problem.id}-${field}`}
                                rows={3}
                                value={problem[field] || ""}
                                disabled={readOnly}
                                onChange={(event) =>
                                  updateProblem(
                                    problem.id,
                                    field,
                                    event.target.value
                                  )
                                }
                              />
                            ) : (
                              <input
                                id={`${problem.id}-${field}`}
                                type="text"
                                value={problem[field] || ""}
                                disabled={readOnly}
                                onChange={(event) =>
                                  updateProblem(
                                    problem.id,
                                    field,
                                    event.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h3>{section.title}</h3>
                  <div className="detail-form-grid">
                    {section.fields.map(([field, label]) => (
                      <div className="detail-field" key={field}>
                        <label htmlFor={`pharmacy-${field}`}>
                          {label}
                        </label>
                        <textarea
                          id={`pharmacy-${field}`}
                          rows={4}
                          value={content[field] || ""}
                          disabled={readOnly}
                          onChange={(event) =>
                            updateField(field, event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          ))}

          {!readOnly && (
            <div
              className="form-actions"
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                marginTop: "1.5rem",
              }}
            >
              <button
                type="button"
                className="primary-button"
                onClick={saveNote}
              >
                Save Draft
              </button>

              {selectedId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={deleteNote}
                >
                  Delete Note
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}