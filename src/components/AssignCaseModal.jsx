import { useEffect, useRef, useState } from "react";
import { assignInstructorCase } from "../lib/api";
import { NOTE_TYPES } from "../lib/noteTypes";

const EMPTY_FORM = {
  title: "",
  patientName: "",
  patientAge: "",
  patientSex: "",
  chiefComplaint: "",
  history: "",
  medications: "",
  allergies: "",
  results: "",
  noteType: "soap",
  dueAt: "",
  expectedDiagnoses: "",
  instructorNotes: "",
};

const EXAMPLE_FORM = {
  title: "Diabetes medication review",
  patientName: "Albert Rivera",
  patientAge: "57",
  patientSex: "Male",
  chiefComplaint: "Follow-up for elevated blood glucose and missed doses",
  history: "Type 2 diabetes diagnosed 10 years ago. Family history of diabetes.",
  medications: "Metformin 500mg daily\nDaily multivitamin",
  allergies: "Penicillin",
  results: "A1C 10.5%. Other labs within normal limits.",
  noteType: "soap",
  dueAt: "",
  expectedDiagnoses: "Type 2 diabetes mellitus, uncontrolled",
  instructorNotes: "Watch for penicillin allergy when choosing therapy.",
};

const EXAMPLE_CRITERIA = [
  { description: "Identifies uncontrolled diabetes", points: "10" },
  { description: "Addresses medication adherence", points: "10" },
  { description: "Adjusts therapy appropriately", points: "15" },
  { description: "Documents follow-up timing", points: "5" },
];

// One entry per line in a text box
function lines(text) {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

function AssignCaseModal({ classroom, students, onClose, onAssigned }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [criteria, setCriteria] = useState([{ description: "", points: "" }]);
  const [studentIds, setStudentIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalPoints = criteria.reduce((sum, item) => sum + (Number(item.points) || 0), 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function updateCriterion(index, field, value) {
    setCriteria((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function toggleStudent(id) {
    setStudentIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!studentIds.length) {
      setError("Select at least one student.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const result = await assignInstructorCase(classroom.id, {
        noteType: form.noteType,
        studentIds,
        dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        patientCase: {
          title: form.title,
          patientName: form.patientName,
          patientAge: form.patientAge,
          patientSex: form.patientSex,
          chiefComplaint: form.chiefComplaint,
          history: form.history,
          medications: lines(form.medications),
          allergies: lines(form.allergies),
          results: form.results,
        },
        expectations: {
          expectedDiagnoses: lines(form.expectedDiagnoses),
          instructorNotes: form.instructorNotes,
          rubricCriteria: criteria.filter((item) => item.description.trim()),
        },
      });
      onAssigned(result);
      dialogRef.current?.close();
    } catch (assignError) {
      setError(assignError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      aria-labelledby="assign-case-title"
      className="assign-modal"
      onClose={onClose}
      ref={dialogRef}
    >
      <form className="assign-modal__form" onSubmit={handleSubmit}>
        <header className="assign-modal__header">
          <p className="section-label">{classroom.short_name}</p>
          <h2 id="assign-case-title">Assign a case</h2>
          <button
            className="text-button"
            onClick={() => {
              setForm(EXAMPLE_FORM);
              setCriteria(EXAMPLE_CRITERIA);
            }}
            type="button"
          >
            Fill example
          </button>
        </header>

        <div className="assign-modal__body">
          <fieldset>
            <legend>Patient case</legend>
            <label>
              Case title
              <input name="title" onChange={update} required value={form.title} />
            </label>
            <div className="assign-modal__row">
              <label>
                Patient name
                <input name="patientName" onChange={update} required value={form.patientName} />
              </label>
              <label>
                Age
                <input
                  max="120"
                  min="0"
                  name="patientAge"
                  onChange={update}
                  type="number"
                  value={form.patientAge}
                />
              </label>
            </div>
            <label>
              Sex
              <select name="patientSex" onChange={update} value={form.patientSex}>
                <option value="">Not specified</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Chief complaint
              <textarea name="chiefComplaint" onChange={update} rows={2} value={form.chiefComplaint} />
            </label>
            <label>
              Medical history
              <textarea name="history" onChange={update} rows={3} value={form.history} />
            </label>
            <label>
              Current medications (one per line)
              <textarea name="medications" onChange={update} rows={3} value={form.medications} />
            </label>
            <label>
              Allergies (one per line)
              <textarea name="allergies" onChange={update} rows={2} value={form.allergies} />
            </label>
            <label>
              Results (labs, vitals)
              <textarea name="results" onChange={update} rows={2} value={form.results} />
            </label>
          </fieldset>

          <fieldset>
            <legend>Note, due date and students</legend>
            <label>
              Note type
              <select name="noteType" onChange={update} value={form.noteType}>
                {NOTE_TYPES.map((type) => (
                  <option disabled={!type.available} key={type.id} value={type.id}>
                    {type.label}
                    {type.available ? "" : " (coming soon)"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Due date (optional)
              <input name="dueAt" onChange={update} type="datetime-local" value={form.dueAt} />
            </label>

            <div className="assign-modal__students">
              <p>Students in {classroom.short_name}</p>
              {students.map((student) => (
                <label key={student.id}>
                  <input
                    checked={studentIds.includes(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    type="checkbox"
                  />
                  {student.name}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Expected answers and rubric (only instructors can see this)</legend>
            <label>
              Expected diagnoses (one per line)
              <textarea
                name="expectedDiagnoses"
                onChange={update}
                rows={2}
                value={form.expectedDiagnoses}
              />
            </label>

            <div className="rubric-editor">
              <p>Rubric (total: {totalPoints} points)</p>
              {criteria.map((item, index) => (
                <div className="rubric-editor__row" key={index}>
                  <input
                    aria-label={`Criterion ${index + 1}`}
                    onChange={(event) => updateCriterion(index, "description", event.target.value)}
                    placeholder="What the student should show"
                    value={item.description}
                  />
                  <input
                    aria-label={`Points for criterion ${index + 1}`}
                    min="0"
                    onChange={(event) => updateCriterion(index, "points", event.target.value)}
                    placeholder="Pts"
                    type="number"
                    value={item.points}
                  />
                  <button
                    aria-label={`Remove criterion ${index + 1}`}
                    className="row-action"
                    onClick={() => setCriteria((current) => current.filter((_, i) => i !== index))}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="text-button"
                onClick={() => setCriteria((current) => [...current, { description: "", points: "" }])}
                type="button"
              >
                + Add criterion
              </button>
            </div>

            <label>
              Notes for the grader
              <textarea
                name="instructorNotes"
                onChange={update}
                rows={2}
                value={form.instructorNotes}
              />
            </label>
          </fieldset>

          {error && <p role="alert">{error}</p>}
        </div>

        <footer className="assign-modal__footer form-actions">
          <button
            className="secondary-button"
            disabled={saving}
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            Cancel
          </button>
          <button className="primary-button" disabled={saving} type="submit">
            {saving ? "Assigning..." : "Assign case"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default AssignCaseModal;