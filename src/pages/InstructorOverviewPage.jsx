import { instructorOverviewPreview } from "../lib/instructorPreviewData";

function InstructorOverviewPage({ user }) {
  const firstName = user.name.split(" ")[0];

  return (
    <div className="dashboard-page content-page instructor-workspace">
      <section className="page-heading">
        <div>
          <p className="section-label">Instructor workspace · overview</p>
          <h1>Good afternoon, {firstName}</h1>
          <p>Keep a pulse on your classrooms, learner progress, and the work that needs your attention.</p>
        </div>
      </section>

      <section className="instructor-overview-metrics">
        {instructorOverviewPreview.metrics.map((metric) => (
          <article className={`panel instructor-overview-metric instructor-overview-metric--${metric.tone}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="instructor-overview-grid">
        <article className="panel classroom-health-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Your classrooms</p>
              <h2>Classroom activity</h2>
            </div>
            <span className="preview-label">Preview data</span>
          </div>
          <div className="classroom-health-list">
            {instructorOverviewPreview.classrooms.map((classroom) => (
              <article key={classroom.name}>
                <div className="classroom-health-list__heading">
                  <div>
                    <h3>{classroom.name}</h3>
                    <p>{classroom.learners} learners · {classroom.groups} groups · {classroom.activeCases} active cases</p>
                  </div>
                  <span>{classroom.next}</span>
                </div>
                <div className="progress-track"><b style={{ width: `${classroom.progress}%` }} /></div>
                <small>{classroom.progress}% of current work completed</small>
              </article>
            ))}
          </div>
        </article>

        <article className="panel review-queue-panel">
          <div className="panel__header">
            <div>
              <p className="section-label">Review queue</p>
              <h2>Needs your attention</h2>
            </div>
            <span className="queue-count">6</span>
          </div>
          {instructorOverviewPreview.reviewQueue.map((item) => (
            <div className="instructor-review-item" key={`${item.learner}-${item.item}`}>
              <span>{item.learner.split(" ").map((name) => name[0]).join("")}</span>
              <div><h3>{item.learner}</h3><p>{item.item} · {item.classroom}</p></div>
              <small>{item.status}</small>
            </div>
          ))}
          <button className="secondary-button" type="button">Open review queue</button>
        </article>
      </section>

      <section className="instructor-next-step">
        <div>
          <p className="section-label">Next step</p>
          <h2>Set up your next clinical learning experience.</h2>
          <p>Use Classes to organize learners into groups, then assign a scenario to the whole classroom, a group, or an individual learner.</p>
        </div>
        <span>01</span>
      </section>
    </div>
  );
}

export default InstructorOverviewPage;
