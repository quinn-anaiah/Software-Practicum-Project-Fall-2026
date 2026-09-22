import { useState } from "react";
import Icon from "../components/Icon";
import { assignedCohort } from "../lib/instructorData";

function InstructorCohortsPage({
  cohortStudents,
  cohortGroups,
  classrooms,
  activeClassroom,
  setActiveClassroomId,
  addClassroom,
  addCohortStudent,
  addCohortGroup,
  onNavigate,
  rosterConfirmed,
  setRosterConfirmed,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [message, setMessage] = useState("");
  const [rosterView, setRosterView] = useState("group");
  const [selectedGroup, setSelectedGroup] = useState("All groups");
  const [selectedLearnerId, setSelectedLearnerId] = useState("all");
  const visibleStudents =
    rosterView === "group"
      ? cohortStudents.filter(
          (student) =>
            selectedGroup === "All groups" || student.group === selectedGroup,
        )
      : cohortStudents.filter(
          (student) =>
            selectedLearnerId === "all" || student.id === selectedLearnerId,
        );
  function addLearner(learner) {
    addCohortStudent(learner);
    setIsAdding(false);
    setMessage(
      `${learner.name} was added. Confirm roster access before publishing cases.`,
    );
  }
  function confirmRoster() {
    setRosterConfirmed(true);
    setMessage(
      "Roster confirmed. Case assignments can now be published to this cohort.",
    );
  }
  function createGroup(groupName) {
    if (addCohortGroup(groupName)) {
      setIsCreatingGroup(false);
      setMessage(
        `${groupName.trim()} was created and is ready for assignment.`,
      );
      return;
    }
    setMessage("Enter a unique group name to create a new group.");
  }
  function createClassroom(classroomName) {
    if (addClassroom(classroomName)) {
      setIsCreatingClassroom(false);
      setMessage(
        `${classroomName.trim()} is active. Add learners before confirming access.`,
      );
      return;
    }
    setMessage(
      "Enter a unique classroom name to create another active roster.",
    );
  }
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Cohort & roster</p>
          <h1>{activeClassroom.name}</h1>
          <p>
            {assignedCohort.section} · {assignedCohort.term}
          </p>
        </div>
        <div className="page-heading__actions">
          <button
            className="outline-button"
            onClick={() => setIsCreatingClassroom(true)}
            type="button"
          >
            <Icon name="plus" size={16} /> Add classroom
          </button>
          <button
            className="outline-button"
            onClick={() => setIsCreatingGroup(true)}
            type="button"
          >
            <Icon name="plus" size={16} /> Add group
          </button>
          <button
            className="primary-button"
            onClick={() => setIsAdding(true)}
            type="button"
          >
            <Icon name="plus" size={18} /> Add learner
          </button>
        </div>
      </section>
      {message && (
        <div className="decision-banner">
          <strong>{message}</strong>
        </div>
      )}
      {isAdding && (
        <LearnerForm
          groups={cohortGroups}
          onCancel={() => setIsAdding(false)}
          onSave={addLearner}
        />
      )}
      {isCreatingGroup && (
        <GroupForm
          onCancel={() => setIsCreatingGroup(false)}
          onSave={createGroup}
        />
      )}
      <section className="classroom-switcher panel">
        <div>
          <p className="section-label">Active classroom</p>
          <h2>Switch between independent rosters</h2>
          <p>
            Each classroom keeps its own learners, groups, confirmed access, and
            case assignments.
          </p>
        </div>
        <label>
          Classroom
          <select
            onChange={(event) => setActiveClassroomId(event.target.value)}
            value={activeClassroom.id}
          >
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name} · {classroom.students.length} learners
              </option>
            ))}
          </select>
        </label>
      </section>
      {isCreatingClassroom && (
        <ClassroomForm
          onCancel={() => setIsCreatingClassroom(false)}
          onSave={createClassroom}
        />
      )}
      <section className="cohort-confirmation">
        <div>
          <span
            className={`status-badge ${rosterConfirmed ? "status-badge--active" : "status-badge--pending"}`}
          >
            {rosterConfirmed ? "Roster confirmed" : "Confirmation needed"}
          </span>
          <h2>
            {rosterConfirmed
              ? "Access is now scoped to this cohort."
              : "Confirm learner access before publishing scenarios."}
          </h2>
          <p>
            Only active learners below can access the scenarios assigned to
            their group or individual account.
          </p>
        </div>
        <div className="cohort-confirmation__actions">
          <button
            className="outline-button"
            disabled={rosterConfirmed}
            onClick={confirmRoster}
            type="button"
          >
            {rosterConfirmed ? "Roster confirmed" : "Confirm roster access"}
          </button>
          <button
            className="primary-button"
            onClick={() => onNavigate("cases")}
            type="button"
          >
            Continue to cases <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
      <section className="panel data-panel">
        <div className="data-panel__toolbar">
          <strong>
            {visibleStudents.length} of {cohortStudents.length} learners
          </strong>
          <span className="muted-copy">
            View the roster by collaborative group or by an individual learner.
          </span>
        </div>
        <div className="roster-controls">
          <div
            className="roster-controls__tabs"
            role="group"
            aria-label="Roster view"
          >
            <button
              className={
                rosterView === "group"
                  ? "roster-view-button roster-view-button--active"
                  : "roster-view-button"
              }
              onClick={() => setRosterView("group")}
              type="button"
            >
              By group
            </button>
            <button
              className={
                rosterView === "individual"
                  ? "roster-view-button roster-view-button--active"
                  : "roster-view-button"
              }
              onClick={() => setRosterView("individual")}
              type="button"
            >
              Individual learner
            </button>
          </div>
          {rosterView === "group" ? (
            <label>
              Group
              <select
                onChange={(event) => setSelectedGroup(event.target.value)}
                value={selectedGroup}
              >
                <option>All groups</option>
                {cohortGroups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Learner
              <select
                onChange={(event) => setSelectedLearnerId(event.target.value)}
                value={selectedLearnerId}
              >
                <option value="all">All learners</option>
                {cohortStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Learner</th>
                <th>Access</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className="patient-avatar patient-avatar--blue">
                      {student.initials}
                    </span>
                    <span>
                      <strong>{student.name}</strong>
                      <small>{student.id}</small>
                    </span>
                  </td>
                  <td>{student.group}</td>
                  <td>
                    <span className="status-badge status-badge--active">
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="row-action" type="button">
                      <Icon name="arrow" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LearnerForm({ groups, onCancel, onSave }) {
  const [form, setForm] = useState({ name: "", group: groups[0] || "" });
  function submit(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    onSave({
      id: `stu-${Date.now()}`,
      name,
      group: form.group,
      initials,
      status: "Active",
    });
  }
  return (
    <form className="panel learner-form" onSubmit={submit}>
      <div className="panel__header">
        <div>
          <p className="section-label">Add learner</p>
          <h2>Grant cohort access</h2>
        </div>
        <button className="row-action" onClick={onCancel} type="button">
          <Icon name="close" />
        </button>
      </div>
      <label>
        Learner name
        <input
          autoFocus
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="First and last name"
          required
          value={form.name}
        />
      </label>
      <label>
        Assignment group
        <select
          onChange={(event) =>
            setForm((current) => ({ ...current, group: event.target.value }))
          }
          value={form.group}
        >
          {groups.map((group) => (
            <option key={group}>{group}</option>
          ))}
          <option>Individual assignment</option>
        </select>
      </label>
      <div className="form-actions">
        <button className="outline-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Add learner
        </button>
      </div>
    </form>
  );
}

function GroupForm({ onCancel, onSave }) {
  const [groupName, setGroupName] = useState("");
  function submit(event) {
    event.preventDefault();
    onSave(groupName);
  }
  return (
    <form className="panel learner-form group-form" onSubmit={submit}>
      <div className="panel__header">
        <div>
          <p className="section-label">Create assignment group</p>
          <h2>Add a cohort group</h2>
        </div>
        <button className="row-action" onClick={onCancel} type="button">
          <Icon name="close" />
        </button>
      </div>
      <label>
        Group name
        <input
          autoFocus
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="e.g. Group 3"
          required
          value={groupName}
        />
      </label>
      <div className="form-actions">
        <button className="outline-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Create group
        </button>
      </div>
    </form>
  );
}

function ClassroomForm({ onCancel, onSave }) {
  const [classroomName, setClassroomName] = useState("");
  function submit(event) {
    event.preventDefault();
    onSave(classroomName);
  }
  return (
    <form className="panel learner-form group-form" onSubmit={submit}>
      <div className="panel__header">
        <div>
          <p className="section-label">New classroom</p>
          <h2>Create an active roster</h2>
        </div>
        <button className="row-action" onClick={onCancel} type="button">
          <Icon name="close" />
        </button>
      </div>
      <label>
        Classroom name
        <input
          autoFocus
          onChange={(event) => setClassroomName(event.target.value)}
          placeholder="e.g. Classroom 2 · Section B"
          required
          value={classroomName}
        />
      </label>
      <p className="muted-copy">
        A classroom starts empty with its own groups, case assignments, and
        access confirmation.
      </p>
      <div className="form-actions">
        <button className="outline-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Create classroom
        </button>
      </div>
    </form>
  );
}
export default InstructorCohortsPage;
