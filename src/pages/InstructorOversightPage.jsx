import Icon from "../components/Icon";
import { cohortOversight, learnerActivity } from "../lib/instructorData";

function InstructorOversightPage() {
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Cohort-level oversight</p>
          <h1>Performance and audit trail</h1>
          <p>
            Use aggregate activity and recurring errors to guide the next
            teaching intervention.
          </p>
        </div>
        <button className="outline-button" type="button">
          Export activity log
        </button>
      </section>
      <section className="oversight-metrics">
        <Metric value="75%" label="Reached terminal state" />
        <Metric value="1.4 h" label="Average submission time" />
        <Metric value="2" label="Common safety errors" />
      </section>
      <section className="oversight-grid">
        <article className="panel">
          <p className="section-label">Common errors</p>
          <h2>Teaching opportunities</h2>
          <div className="error-list">
            {cohortOversight.commonErrors.map((error) => (
              <div key={error.label}>
                <span>{error.count}</span>
                <p>{error.label}</p>
              </div>
            ))}
          </div>
          <button className="text-button" type="button">
            Plan review session <Icon name="arrow" size={15} />
          </button>
        </article>
        <article className="panel">
          <p className="section-label">Documentation states</p>
          <h2>Submission distribution</h2>
          <div className="state-bars">
            {["Not started", "In progress", "Pending review", "Completed"].map(
              (status) => {
                const count = learnerActivity.filter(
                  (activity) => activity.noteStatus === status,
                ).length;
                return (
                  <div key={status}>
                    <span>{status}</span>
                    <i>
                      <b style={{ width: `${count * 25}%` }} />
                    </i>
                    <strong>{count}</strong>
                  </div>
                );
              },
            )}
          </div>
        </article>
      </section>
      <section className="panel audit-panel">
        <div className="panel__header">
          <div>
            <p className="section-label">Audit log</p>
            <h2>Access and activity</h2>
          </div>
          <span className="muted-copy">Training environment only</span>
        </div>
        {cohortOversight.auditLog.map((entry) => (
          <div className="audit-row" key={entry.event}>
            <span>•</span>
            <div>
              <h3>{entry.event}</h3>
              <p>{entry.detail}</p>
            </div>
            <time>{entry.time}</time>
          </div>
        ))}
      </section>
    </div>
  );
}
function Metric({ label, value }) {
  return (
    <article className="panel">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}
export default InstructorOversightPage;
