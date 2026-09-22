import Icon from "../components/Icon";
import { assignedCohort, learnerActivity } from "../lib/instructorData";

function InstructorDashboardPage({
  cohortStudents,
  instructorCases,
  onNavigate,
  rosterConfirmed,
  user,
}) {
  const inReview = learnerActivity.filter(
    (activity) => activity.noteStatus === "Pending review",
  ).length;
  const completed = learnerActivity.filter(
    (activity) => activity.noteStatus === "Completed",
  ).length;

  return (
    <div className="dashboard-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Instructor workspace · {assignedCohort.section}
          </p>
          <h1>Welcome, {user.name}</h1>
          <p>
            Prepare scenarios, guide expectations, and supervise learner
            progress.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => onNavigate("cases")}
          type="button"
        >
          <Icon name="plus" size={18} /> Set up a case
        </button>
      </section>
      <section className="metric-grid instructor-metrics">
        <Metric
          label="Assigned learners"
          value={cohortStudents.length}
          detail={
            rosterConfirmed
              ? "Roster access confirmed"
              : "Roster confirmation needed"
          }
          tone="teal"
        />
        <Metric
          label="Active cases"
          value={instructorCases.length}
          detail="Configured scenarios"
          tone="blue"
        />
        <Metric
          label="Awaiting review"
          value={inReview}
          detail="Notes ready to review"
          tone="lavender"
        />
        <Metric
          label="Completed"
          value={completed}
          detail="Learner submissions"
          tone="gold"
        />
      </section>
      <section className="workflow-panel">
        <div>
          <p className="section-label">Instructor workflow</p>
          <h2>Guide each cohort from setup to review</h2>
        </div>
        <div className="workflow-steps">
          <WorkflowStep
            number="01"
            label="Confirm cohort"
            action={() => onNavigate("cohorts")}
          />
          <WorkflowStep
            number="02"
            label="Assign scenarios"
            action={() => onNavigate("cases")}
          />
          <WorkflowStep
            number="03"
            label="Set expectations"
            action={() => onNavigate("expectations")}
          />
          <WorkflowStep
            number="04"
            label="Monitor work"
            action={() => onNavigate("monitoring")}
          />
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Needs attention</p>
              <h2>Pending instructor review</h2>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("monitoring")}
              type="button"
            >
              Open monitor <Icon name="arrow" size={15} />
            </button>
          </div>
          {learnerActivity
            .filter((activity) => activity.noteStatus === "Pending review")
            .map((activity) => (
              <div className="review-row" key={activity.studentId}>
                <span className="patient-avatar patient-avatar--purple">
                  {activity.initials}
                </span>
                <div>
                  <h3>{activity.student}</h3>
                  <p>
                    {activity.caseTitle} · submitted {activity.lastActivity}
                  </p>
                </div>
                <span className="status-badge status-badge--pending">
                  Review
                </span>
              </div>
            ))}
        </article>
        <article className="panel">
          <p className="section-label">Cohort access</p>
          <h2>{assignedCohort.name}</h2>
          <p className="muted-copy">{assignedCohort.term}</p>
          <div className="cohort-summary">
            <span>
              {cohortStudents.length}
              <small>Learners</small>
            </span>
            <span>
              {instructorCases.length}
              <small>Scenarios</small>
            </span>
            <span>
              2<small>Groups</small>
            </span>
          </div>
          <button
            className="outline-button"
            onClick={() => onNavigate("cohorts")}
            type="button"
          >
            View roster <Icon name="arrow" size={15} />
          </button>
        </article>
      </section>
    </div>
  );
}
function Metric({ label, value, detail, tone }) {
  return (
    <article className="metric-card">
      <span className={`metric-card__icon metric-card__icon--${tone}`}>
        <Icon name="grid" />
      </span>
      <p>{label}</p>
      <h2>{value}</h2>
      <span className="metric-card__change">{detail}</span>
    </article>
  );
}
function WorkflowStep({ action, label, number }) {
  return (
    <button className="workflow-step" onClick={action} type="button">
      <span>{number}</span>
      <strong>{label}</strong>
      <Icon name="arrow" size={15} />
    </button>
  );
}
export default InstructorDashboardPage;
