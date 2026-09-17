import { patientProfiles } from "../lib/patientData";

function HealthInsightsPage({ user }) {
  const { insights } = patientProfiles[user.id];
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Health insights</p>
          <h1>Your health overview</h1>
          <p>Simple reminders and trends based on your care plan.</p>
        </div>
        <button className="outline-button" type="button">
          Download summary
        </button>
      </section>
      <section className="insight-card-grid">
        {insights.map((insight) => (
          <article
            className={`insight-card insight-card--${insight.color}`}
            key={insight.title}
          >
            <p>{insight.title}</p>
            <h2>{insight.value}</h2>
            <span>{insight.description}</span>
          </article>
        ))}
      </section>
      <section className="panel progress-panel">
        <div>
          <p className="section-label">Care plan progress</p>
          <h2>Small steps, meaningful progress</h2>
          <p className="muted-copy">
            You have completed 3 of 4 recommended actions for this season.
          </p>
        </div>
        <div className="progress-track">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="progress-labels">
          <span>Medication review</span>
          <span>Wellness visit</span>
          <span>Lab work</span>
          <span>Flu vaccine</span>
        </div>
      </section>
    </div>
  );
}
export default HealthInsightsPage;
