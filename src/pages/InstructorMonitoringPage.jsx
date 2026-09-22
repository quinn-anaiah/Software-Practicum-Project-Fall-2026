import Icon from "../components/Icon";
import { learnerActivity } from "../lib/instructorData";

function InstructorMonitoringPage({ onNavigate }) {
  const statuses = [
    "Not started",
    "In progress",
    "Pending review",
    "Completed",
  ];
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Monitoring in progress</p>
          <h1>Learner activity</h1>
          <p>
            Track case progress, encounter state, and documentation submissions.
          </p>
        </div>
        <button className="outline-button" type="button">
          Refresh activity
        </button>
      </section>
      <section className="progress-summary">
        {statuses.map((status) => (
          <div key={status}>
            <strong>
              {
                learnerActivity.filter(
                  (activity) => activity.noteStatus === status,
                ).length
              }
            </strong>
            <span>{status}</span>
          </div>
        ))}
      </section>
      <section className="panel data-panel">
        <div className="data-panel__toolbar">
          <strong>Case submissions</strong>
          <span className="muted-copy">Updated moments ago · demo data</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Learner</th>
                <th>Assigned case</th>
                <th>Encounter</th>
                <th>Documentation</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {learnerActivity.map((activity) => (
                <tr key={activity.studentId}>
                  <td>
                    <span className="patient-avatar patient-avatar--purple">
                      {activity.initials}
                    </span>
                    <span>
                      <strong>{activity.student}</strong>
                      <small>{activity.group}</small>
                    </span>
                  </td>
                  <td>{activity.caseTitle}</td>
                  <td>
                    <span className="status-badge">
                      {activity.encounterStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-badge--${activity.noteStatus.toLowerCase().replaceAll(" ", "-")}`}
                    >
                      {activity.noteStatus}
                    </span>
                  </td>
                  <td>{activity.lastActivity}</td>
                  <td>
                    <button
                      aria-label={`Review ${activity.student}`}
                      className="row-action"
                      onClick={() => onNavigate("review")}
                      type="button"
                    >
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
export default InstructorMonitoringPage;
