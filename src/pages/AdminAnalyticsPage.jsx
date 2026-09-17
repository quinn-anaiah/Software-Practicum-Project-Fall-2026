import { analyticsData } from "../lib/adminData";

function AdminAnalyticsPage() {
  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Practice intelligence</p>
          <h1>Analytics</h1>
          <p>
            Understand trends across your practice with a clear weekly view.
          </p>
        </div>
        <button className="outline-button" type="button">
          Last 12 months
        </button>
      </section>
      <section className="metric-grid analytics-metrics">
        {analyticsData.metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <h2>{metric.value}</h2>
            <span className="metric-card__change">
              {metric.change} vs. prior period
            </span>
          </article>
        ))}
      </section>
      <section className="panel analytics-chart-panel">
        <div className="panel__header">
          <div>
            <p className="section-label">Patient visits</p>
            <h2>Monthly visit volume</h2>
          </div>
          <span className="chart-legend">
            <i /> Visits
          </span>
        </div>
        <div className="analytics-bars">
          {analyticsData.monthlyVisits.map((height, index) => (
            <div key={index}>
              <span style={{ height: `${height}%` }} />
              <small>{index + 1}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="insight-grid">
        <article className="panel">
          <p className="section-label">Retention</p>
          <h2>86% of patients returned this quarter</h2>
          <p className="muted-copy">
            A steady improvement from 81% in the previous quarter.
          </p>
        </article>
        <article className="panel">
          <p className="section-label">Operations</p>
          <h2>Tuesday is your busiest day</h2>
          <p className="muted-copy">
            Consider opening two additional appointment blocks between 9–11 AM.
          </p>
        </article>
      </section>
    </div>
  );
}
export default AdminAnalyticsPage;
