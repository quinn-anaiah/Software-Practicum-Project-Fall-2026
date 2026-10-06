import { useEffect, useState } from "react";
import {
  createInstructorClassroom,
  fetchEligibleInstructorStudents,
  fetchInstructorClassroom,
  fetchInstructorClassrooms,
} from "../lib/api";

const emptyForm = {
  crn: "",
  fullName: "",
  shortName: "",
  room: "",
  term: "Fall 2026",
};

function InstructorClassesPage({ user }) {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [classroomDetail, setClassroomDetail] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function loadClassrooms(selectId = "") {
    const result = await fetchInstructorClassrooms();
    setClassrooms(result.classrooms);
    setClassroomId(selectId || result.classrooms[0]?.id || "");
  }

  useEffect(() => {
    let isCurrent = true;
    async function load() {
      setStatus("loading");
      try {
        const [classroomResult, studentResult] = await Promise.all([
          fetchInstructorClassrooms(),
          fetchEligibleInstructorStudents(),
        ]);
        if (!isCurrent) return;
        setClassrooms(classroomResult.classrooms);
        setClassroomId(classroomResult.classrooms[0]?.id || "");
        setEligibleStudents(studentResult.students);
        setStatus("ready");
      } catch (loadError) {
        if (!isCurrent) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load classrooms.");
        setStatus("error");
      }
    }
    load();
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!classroomId) {
      return undefined;
    }
    let isCurrent = true;
    async function loadDetail() {
      try {
        const result = await fetchInstructorClassroom(classroomId);
        if (isCurrent) setClassroomDetail(result);
      } catch (detailError) {
        if (isCurrent) setError(detailError instanceof Error ? detailError.message : "Unable to load classroom details.");
      }
    }
    loadDetail();
    return () => { isCurrent = false; };
  }, [classroomId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleStudent(studentId) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const result = await createInstructorClassroom({
        ...form,
        studentIds: selectedStudentIds,
      });
      await loadClassrooms(result.classroom.id);
      setForm(emptyForm);
      setSelectedStudentIds([]);
      setIsCreateOpen(false);
      setNotice(result.message);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create classroom.");
    } finally {
      setIsSaving(false);
    }
  }

  const classroom = classroomDetail?.classroom;

  return (
    <div className="dashboard-page content-page instructor-workspace">
      <section className="page-heading">
        <div>
          <p className="section-label">Instructor workspace · classes</p>
          <h1>Classes & case assignments</h1>
          <p>
            Create {user.subrole || "discipline"} classrooms and enroll only
            students whose subrole matches yours.
          </p>
        </div>
        <button
          className="primary-button directory-create-button"
          disabled={!user.subrole}
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          + Create class
        </button>
      </section>

      {(error || notice) && (
        <section className={`panel directory-action-message ${error ? "directory-error" : "directory-success"}`} role="status">
          {error || notice}
        </section>
      )}

      {!user.subrole && (
        <section className="panel discipline-notice">
          Your profile needs an assigned subrole before you can create a classroom.
        </section>
      )}

      {isCreateOpen && (
        <section className="panel create-class-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">New classroom · {user.subrole}</p>
              <h2>Create a classroom</h2>
            </div>
            <button aria-label="Close classroom form" className="row-action" onClick={() => setIsCreateOpen(false)} type="button">×</button>
          </div>
          <form className="create-class-form" onSubmit={handleCreate}>
            <div className="classroom-fields">
              <label>CRN<input name="crn" onChange={updateField} required value={form.crn} /></label>
              <label>Full name<input name="fullName" onChange={updateField} placeholder={`e.g. ${user.subrole} Foundations`} required value={form.fullName} /></label>
              <label>Short name<input name="shortName" onChange={updateField} placeholder="e.g. PT Foundations" required value={form.shortName} /></label>
              <label>Room<input name="room" onChange={updateField} placeholder="e.g. HSSN 210" value={form.room} /></label>
              <label>Term<input name="term" onChange={updateField} required value={form.term} /></label>
            </div>
            <div>
              <p className="section-label">Eligible learners</p>
              <p className="create-class-form__hint">
                Only Students with the <strong>{user.subrole}</strong> subrole are shown.
              </p>
              <div className="eligible-learner-list">
                {eligibleStudents.map((student) => (
                  <label key={student.id}>
                    <input checked={selectedStudentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} type="checkbox" />
                    <span>{student.name}</span>
                    <small>{student.subrole}</small>
                  </label>
                ))}
                {!eligibleStudents.length && <p className="directory-loading">No eligible students are available.</p>}
              </div>
            </div>
            <div className="admin-form__actions">
              <button className="secondary-button" onClick={() => setIsCreateOpen(false)} type="button">Cancel</button>
              <button className="primary-button" disabled={isSaving} type="submit">{isSaving ? "Creating…" : "Create class"}</button>
            </div>
          </form>
        </section>
      )}

      {status === "loading" && <section className="panel directory-loading">Loading classrooms…</section>}
      {status === "error" && !error && <section className="panel directory-error">Unable to load classrooms.</section>}

      {status === "ready" && !classrooms.length && (
        <section className="panel empty-state">
          <p className="section-label">No classrooms yet</p>
          <h2>Create your first {user.subrole} classroom</h2>
          <p>Add the course details and select eligible students to begin building a roster.</p>
        </section>
      )}

      {classrooms.length > 0 && classroom && (
        <>
          <section className="panel class-selector">
            <div>
              <p className="section-label">Active classroom · {classroom.discipline}</p>
              <h2>{classroom.full_name}</h2>
              <p>{classroom.short_name} · CRN {classroom.crn} · {classroom.room || "Room not assigned"} · {classroom.term}</p>
            </div>
            <label>
              Switch classroom
              <select onChange={(event) => setClassroomId(event.target.value)} value={classroomId}>
                {classrooms.map((item) => <option key={item.id} value={item.id}>{item.short_name}</option>)}
              </select>
            </label>
          </section>

          <section className="classes-layout">
            <article className="panel classroom-roster-panel">
              <div className="panel__header">
                <div><p className="section-label">Roster · {classroom.discipline}</p><h2>Enrolled learners</h2></div>
                <span className="preview-label">{classroomDetail.students.length} active</span>
              </div>
              <div className="learner-chip-list">
                {classroomDetail.students.map((student) => <span key={student.id}>{student.name}</span>)}
                {!classroomDetail.students.length && <span>No learners added yet</span>}
              </div>
            </article>
            <article className="panel assignment-builder">
              <p className="section-label">Case assignments</p>
              <h2>Ready for scenario assignments</h2>
              <p className="assignment-builder__copy">This classroom and its matching-discipline roster are now real database records. Scenario assignment tables are the next step.</p>
              <button className="secondary-button" disabled type="button">Scenario tools coming next</button>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default InstructorClassesPage;
