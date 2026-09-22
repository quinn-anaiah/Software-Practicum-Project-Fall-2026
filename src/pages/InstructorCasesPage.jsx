import { useState } from "react";
import Icon from "../components/Icon";

const dataOptions = [
  "Vitals",
  "Medication list",
  "Allergies",
  "Lab results",
  "Prior note",
  "Discharge summary",
  "Imaging",
  "Wound photo",
];
const startingStatuses = ["Scheduled", "Checked in", "Roomed", "In progress"];

function InstructorCasesPage({
  classrooms,
  activeClassroom,
  setActiveClassroomId,
  cohortGroups,
  cohortStudents,
  instructorCases,
  onNavigate,
  rosterConfirmed,
  addInstructorCase,
  updateInstructorCase,
}) {
  const [selectedCaseId, setSelectedCaseId] = useState(instructorCases[0]?.id);
  const [isCreating, setIsCreating] = useState(false);
  const selectedCase = instructorCases.find(
    (caseItem) => caseItem.id === selectedCaseId,
  );
  function saveNewCase(caseData) {
    addInstructorCase(caseData);
    setSelectedCaseId(`CASE-${instructorCases.length + 1}`);
    setIsCreating(false);
  }

  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Case & roster setup</p>
          <h1>Scenarios and assignments</h1>
          <p>
            Select a training case, define the available data, and scope it to
            the right learners.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setIsCreating(true)}
          type="button"
        >
          <Icon name="plus" size={18} /> Create scenario
        </button>
      </section>
      <section className="classroom-switcher panel">
        <div>
          <p className="section-label">Active classroom</p>
          <h2>Scenario workspace · {activeClassroom.name}</h2>
          <p>
            Cases here are visible only to this classroom’s roster and retain
            their own learner assignments.
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
                {classroom.name} · {classroom.cases.length} scenarios
              </option>
            ))}
          </select>
        </label>
      </section>
      {!rosterConfirmed && (
        <div className="setup-warning">
          <strong>
            Confirm the cohort roster before publishing assignments.
          </strong>
          <button
            className="text-button"
            onClick={() => onNavigate("cohorts")}
            type="button"
          >
            Review roster <Icon name="arrow" size={15} />
          </button>
        </div>
      )}
      {isCreating && (
        <ScenarioForm
          cohortStudents={cohortStudents}
          groups={cohortGroups}
          onCancel={() => setIsCreating(false)}
          onSave={saveNewCase}
        />
      )}
      {!selectedCase && !isCreating && (
        <section className="panel empty-state">
          <p className="section-label">No scenarios yet</p>
          <h2>Set up this classroom’s first training case</h2>
          <p>
            Create a scenario after adding learners or groups to the classroom
            roster.
          </p>
        </section>
      )}
      {selectedCase && (
        <section className="case-setup-layout">
          <div className="case-list">
            {instructorCases.map((caseItem) => (
              <button
                className={
                  caseItem.id === selectedCaseId
                    ? "case-list__item case-list__item--selected"
                    : "case-list__item"
                }
                key={caseItem.id}
                onClick={() => setSelectedCaseId(caseItem.id)}
                type="button"
              >
                <span>{caseItem.id}</span>
                <strong>{caseItem.title}</strong>
                <small>
                  {caseItem.assignment} · Due {caseItem.dueDate.split(" · ")[0]}
                </small>
              </button>
            ))}
          </div>
          <CaseDetail
            key={selectedCase.id}
            caseItem={selectedCase}
            cohortStudents={cohortStudents}
            groups={cohortGroups}
            onNavigate={onNavigate}
            onUpdate={updateInstructorCase}
            rosterConfirmed={rosterConfirmed}
          />
        </section>
      )}
    </div>
  );
}

function CaseDetail({
  caseItem,
  cohortStudents,
  groups,
  onNavigate,
  onUpdate,
  rosterConfirmed,
}) {
  const [assignmentMode, setAssignmentMode] = useState(
    caseItem.assignmentType || "group",
  );
  const options =
    assignmentMode === "group"
      ? groups
      : cohortStudents.map((student) => student.name);
  const currentTarget = options.includes(caseItem.assignment)
    ? caseItem.assignment
    : options[0];
  function updateAssignment(event) {
    onUpdate(caseItem.id, {
      assignmentType: assignmentMode,
      assignment: event.target.value,
    });
  }
  function changeAssignmentMode(mode) {
    const targets =
      mode === "group" ? groups : cohortStudents.map((student) => student.name);
    setAssignmentMode(mode);
    onUpdate(caseItem.id, {
      assignmentType: mode,
      assignment: targets[0] || "",
    });
  }
  return (
    <article className="panel case-detail">
      <div className="panel__header">
        <div>
          <p className="section-label">Selected scenario · {caseItem.id}</p>
          <h2>{caseItem.title}</h2>
        </div>
        <span className="status-badge status-badge--active">
          {rosterConfirmed ? "Ready" : "Draft"}
        </span>
      </div>
      <p className="muted-copy">{caseItem.summary}</p>
      <div className="case-detail__grid">
        <div>
          <span>Training patient</span>
          <strong>{caseItem.patientName}</strong>
        </div>
        <div>
          <span>Starting status</span>
          <strong>{caseItem.startingStatus}</strong>
        </div>
        <div>
          <span>Assigned to</span>
          <strong>{caseItem.assignment}</strong>
        </div>
        <div>
          <span>Due date</span>
          <strong>{caseItem.dueDate}</strong>
        </div>
      </div>
      <div className="assignment-editor">
        <p className="section-label">Assignment access</p>
        <div>
          <label>
            <input
              checked={assignmentMode === "group"}
              onChange={() => changeAssignmentMode("group")}
              type="radio"
            />{" "}
            Group
          </label>
          <label>
            <input
              checked={assignmentMode === "individual"}
              onChange={() => changeAssignmentMode("individual")}
              type="radio"
            />{" "}
            Individual learner
          </label>
          <select onChange={updateAssignment} value={currentTarget}>
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="available-data">
        <p className="section-label">Available at case start</p>
        <div>
          {caseItem.availableData.map((dataPoint) => (
            <span key={dataPoint}>✓ {dataPoint}</span>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="outline-button" type="button">
          Edit case setup
        </button>
        <button
          className="primary-button"
          onClick={() => onNavigate("expectations")}
          type="button"
        >
          Define expectations <Icon name="arrow" size={15} />
        </button>
      </div>
    </article>
  );
}

function ScenarioForm({ cohortStudents, groups, onCancel, onSave }) {
  const [form, setForm] = useState({
    title: "",
    patientName: "",
    summary: "",
    startingStatus: "Checked in",
    availableData: ["Vitals", "Medication list"],
    assignmentType: "group",
    assignment: groups[0] || "",
    dueDate: "Oct 7, 2026 · 11:59 PM",
  });
  const targets =
    form.assignmentType === "group"
      ? groups
      : cohortStudents.map((student) => student.name);
  function changeField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  function toggleData(dataPoint) {
    setForm((current) => ({
      ...current,
      availableData: current.availableData.includes(dataPoint)
        ? current.availableData.filter((item) => item !== dataPoint)
        : [...current.availableData, dataPoint],
    }));
  }
  function switchAssignmentMode(mode) {
    setForm((current) => ({
      ...current,
      assignmentType: mode,
      assignment:
        mode === "group" ? groups[0] || "" : cohortStudents[0]?.name || "",
    }));
  }
  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.patientName.trim() || !form.assignment)
      return;
    onSave(form);
  }
  return (
    <form className="panel scenario-form" onSubmit={submit}>
      <div className="panel__header">
        <div>
          <p className="section-label">New training scenario</p>
          <h2>Configure the case start</h2>
        </div>
        <button className="row-action" onClick={onCancel} type="button">
          <Icon name="close" />
        </button>
      </div>
      <div className="scenario-form__grid">
        <label>
          Scenario title
          <input
            name="title"
            onChange={changeField}
            placeholder="e.g. Diabetes medication check"
            required
            value={form.title}
          />
        </label>
        <label>
          Training patient
          <input
            name="patientName"
            onChange={changeField}
            placeholder="Test Patient — Name"
            required
            value={form.patientName}
          />
        </label>
        <label>
          Starting patient status
          <select
            name="startingStatus"
            onChange={changeField}
            value={form.startingStatus}
          >
            {startingStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input name="dueDate" onChange={changeField} value={form.dueDate} />
        </label>
      </div>
      <label>
        Scenario summary
        <textarea
          name="summary"
          onChange={changeField}
          placeholder="Describe the learning scenario and clinical context."
          value={form.summary}
        />
      </label>
      <fieldset>
        <legend>Available data at case start</legend>
        <div className="data-checkboxes">
          {dataOptions.map((dataPoint) => (
            <label key={dataPoint}>
              <input
                checked={form.availableData.includes(dataPoint)}
                onChange={() => toggleData(dataPoint)}
                type="checkbox"
              />{" "}
              {dataPoint}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Assignment scope</legend>
        <div className="assignment-form">
          <label>
            <input
              checked={form.assignmentType === "group"}
              onChange={() => switchAssignmentMode("group")}
              type="radio"
            />{" "}
            Group
          </label>
          <label>
            <input
              checked={form.assignmentType === "individual"}
              onChange={() => switchAssignmentMode("individual")}
              type="radio"
            />{" "}
            Individual learner
          </label>
          <select
            name="assignment"
            onChange={changeField}
            value={form.assignment}
          >
            {targets.map((target) => (
              <option key={target}>{target}</option>
            ))}
          </select>
        </div>
      </fieldset>
      <div className="form-actions">
        <button className="outline-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save training scenario
        </button>
      </div>
    </form>
  );
}
export default InstructorCasesPage;
