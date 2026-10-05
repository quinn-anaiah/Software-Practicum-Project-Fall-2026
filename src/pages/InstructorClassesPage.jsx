import { useMemo, useState } from "react";
import {
  createClassroomPreview,
  eligibleLearnerPreview,
  scenarioPreview,
} from "../lib/instructorPreviewData";

function InstructorClassesPage({ user }) {
  const discipline = user.subrole || "Unassigned discipline";
  const [classrooms, setClassrooms] = useState(() =>
    createClassroomPreview(discipline),
  );
  const [classroomId, setClassroomId] = useState(classrooms[0].id);
  const [scenarioId, setScenarioId] = useState(scenarioPreview[0].id);
  const [audience, setAudience] = useState("entire-classroom");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [selectedLearnerIds, setSelectedLearnerIds] = useState([]);
  const [assignments, setAssignments] = useState(() =>
    Object.fromEntries(
      classrooms.map((classroom) => [classroom.id, classroom.assignments]),
    ),
  );
  const classroom = useMemo(
    () => classrooms.find((item) => item.id === classroomId),
    [classroomId, classrooms],
  );
  const scenario = scenarioPreview.find((item) => item.id === scenarioId);
  const eligibleLearners = eligibleLearnerPreview.filter(
    (learner) => learner.subrole === discipline,
  );

  function toggleLearner(learnerId) {
    setSelectedLearnerIds((current) =>
      current.includes(learnerId)
        ? current.filter((id) => id !== learnerId)
        : [...current, learnerId],
    );
  }

  function createClassroom(event) {
    event.preventDefault();
    const selectedLearners = eligibleLearners
      .filter((learner) => selectedLearnerIds.includes(learner.id))
      .map((learner) => learner.name);
    const newClassroom = {
      id: `new-class-${classrooms.length + 1}`,
      name: newClassName.trim(),
      term: "Fall 2026",
      discipline,
      learners: selectedLearners,
      groups: [],
      assignments: [],
    };

    setClassrooms((current) => [...current, newClassroom]);
    setAssignments((current) => ({ ...current, [newClassroom.id]: [] }));
    setClassroomId(newClassroom.id);
    setAudience("entire-classroom");
    setNewClassName("");
    setSelectedLearnerIds([]);
    setIsCreateOpen(false);
  }

  function assignScenario(event) {
    event.preventDefault();
    const audienceName =
      audience === "entire-classroom"
        ? "Entire classroom"
        : classroom.groups.find((group) => group.id === audience)?.name ||
          "Individual learner";

    setAssignments((current) => ({
      ...current,
      [classroomId]: [
        ...current[classroomId],
        {
          scenario: scenario.title,
          target: audienceName,
          state: "Draft assignment",
          due: "Choose due date",
        },
      ],
    }));
  }

  return (
    <div className="dashboard-page content-page instructor-workspace">
      <section className="page-heading">
        <div>
          <p className="section-label">Instructor workspace · classes</p>
          <h1>Classes & case assignments</h1>
          <p>
            Your classroom discipline is based on your Instructor profile. Only
            learners in the same discipline can be added to a classroom.
          </p>
        </div>
        <button
          className="primary-button directory-create-button"
          disabled={!user.subrole}
          onClick={() => setIsCreateOpen(true)}
          type="button"
        >
          + Create {discipline} class
        </button>
      </section>

      {!user.subrole && (
        <section className="panel discipline-notice">
          Your profile needs an assigned subrole before you can create a
          classroom. Ask an administrator to assign your teaching discipline.
        </section>
      )}

      {isCreateOpen && (
        <section className="panel create-class-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">New classroom</p>
              <h2>Create a {discipline} class</h2>
            </div>
            <button className="row-action" onClick={() => setIsCreateOpen(false)} type="button">
              ×
            </button>
          </div>
          <form className="create-class-form" onSubmit={createClassroom}>
            <label>
              Classroom name
              <input
                onChange={(event) => setNewClassName(event.target.value)}
                placeholder={`e.g. ${discipline} Lab · Section C`}
                required
                value={newClassName}
              />
            </label>
            <div>
              <p className="section-label">Eligible learners</p>
              <p className="create-class-form__hint">
                Showing students with the <strong>{discipline}</strong> subrole only.
              </p>
              <div className="eligible-learner-list">
                {eligibleLearners.map((learner) => (
                  <label key={learner.id}>
                    <input
                      checked={selectedLearnerIds.includes(learner.id)}
                      onChange={() => toggleLearner(learner.id)}
                      type="checkbox"
                    />
                    <span>{learner.name}</span>
                    <small>{learner.subrole}</small>
                  </label>
                ))}
                {!eligibleLearners.length && (
                  <p className="directory-loading">
                    No eligible learners are available in this frontend preview.
                  </p>
                )}
              </div>
            </div>
            <div className="admin-form__actions">
              <button className="secondary-button" onClick={() => setIsCreateOpen(false)} type="button">
                Cancel
              </button>
              <button className="primary-button" type="submit">
                Create class
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel class-selector">
        <div>
          <p className="section-label">Active classroom · {classroom.discipline}</p>
          <h2>{classroom.name}</h2>
          <p>
            {classroom.term} · {classroom.learners.length} learners ·{" "}
            {classroom.groups.length} groups
          </p>
        </div>
        <label>
          Switch classroom
          <select
            onChange={(event) => setClassroomId(event.target.value)}
            value={classroomId}
          >
            {classrooms.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="classes-layout">
        <article className="panel classroom-roster-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Roster · {classroom.discipline}</p>
              <h2>Learners & groups</h2>
            </div>
            <button className="secondary-button" type="button">Manage roster</button>
          </div>
          {classroom.groups.length ? (
            <div className="class-group-list">
              {classroom.groups.map((group) => (
                <div key={group.id}>
                  <span>{group.name}</span>
                  <strong>{group.learners} learners</strong>
                  <small>View members →</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="directory-loading">No groups have been created yet.</p>
          )}
          <div className="learner-chip-list">
            {classroom.learners.map((learner) => <span key={learner}>{learner}</span>)}
            {!classroom.learners.length && <span>No learners added yet</span>}
          </div>
        </article>

        <article className="panel assignment-builder">
          <p className="section-label">New assignment</p>
          <h2>Assign a case scenario</h2>
          <p className="assignment-builder__copy">
            Give the whole {discipline} class the same case, or target one of
            its groups.
          </p>
          <form onSubmit={assignScenario}>
            <label>
              Scenario
              <select onChange={(event) => setScenarioId(event.target.value)} value={scenarioId}>
                {scenarioPreview.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>
            <div className="scenario-brief">
              <strong>{scenario.discipline}</strong>
              <span>{scenario.duration}</span>
              <p>Available data: {scenario.data}</p>
            </div>
            <label>
              Assign to
              <select onChange={(event) => setAudience(event.target.value)} value={audience}>
                <option value="entire-classroom">Entire classroom</option>
                {classroom.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </label>
            <button className="primary-button" disabled={!classroom.learners.length} type="submit">
              Create assignment
            </button>
          </form>
        </article>
      </section>

      <section className="panel assignment-table-panel">
        <div className="panel__header">
          <div>
            <p className="section-label">Current scenario work</p>
            <h2>Assignments in {classroom.name}</h2>
          </div>
          <span className="preview-label">Preview data</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Scenario</th><th>Assigned to</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {assignments[classroomId].map((assignment, index) => (
                <tr key={`${assignment.scenario}-${index}`}>
                  <td><strong>{assignment.scenario}</strong></td>
                  <td>{assignment.target}</td>
                  <td><span className="status-badge status-badge--in-progress">{assignment.state}</span></td>
                  <td>{assignment.due}</td>
                </tr>
              ))}
              {!assignments[classroomId].length && (
                <tr><td colSpan="4" className="empty-table-cell">No case scenarios assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default InstructorClassesPage;
