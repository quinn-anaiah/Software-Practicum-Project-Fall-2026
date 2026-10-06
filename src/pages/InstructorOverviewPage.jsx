import { useEffect, useState } from "react";
import { fetchInstructorDashboard } from "../lib/api";

function InstructorOverviewPage({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadDashboard() {
      try {
        const result = await fetchInstructorDashboard();
        if (isCurrent) setDashboard(result);
      } catch (loadError) {
        if (isCurrent) setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
      }
    }
    loadDashboard();
    return () => { isCurrent = false; };
  }, []);

  const firstName = user.name.split(" ")[0];
  const metrics = dashboard
    ? [
        { label: "Assigned learners", value: dashboard.metrics.learners, note: `Across ${dashboard.classrooms.length} classrooms`, tone: "indigo" },
        { label: "Active classrooms", value: dashboard.metrics.activeClassrooms, note: `${dashboard.discipline} discipline`, tone: "teal" },
        { label: "Draft classrooms", value: dashboard.metrics.draftClassrooms, note: "Ready to continue setting up", tone: "amber" },
      ]
    : [];

  return (
    <div className="dashboard-page content-page instructor-workspace">
      <section className="page-heading">
        <div>
          <p className="section-label">Instructor workspace · overview</p>
          <h1>Good afternoon, {firstName}</h1>
          <p>Keep a pulse on your classrooms and their matching-discipline learners.</p>
        </div>
      </section>

      {error && <section className="panel directory-error">{error}</section>}
      {!dashboard && !error && <section className="panel directory-loading">Loading your instructor workspace…</section>}

      {dashboard && (
        <>
          <section className="instructor-overview-metrics">
            {metrics.map((metric) => (
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
                <div><p className="section-label">Your classrooms</p><h2>Classroom activity</h2></div>
                <span className="directory-live-indicator">● Live database</span>
              </div>
              {dashboard.classrooms.length ? (
                <div className="classroom-health-list">
                  {dashboard.classrooms.map((classroom) => (
                    <article key={classroom.id}>
                      <div className="classroom-health-list__heading">
                        <div><h3>{classroom.full_name}</h3><p>{classroom.short_name} · CRN {classroom.crn} · {classroom.room || "Room unassigned"}</p></div>
                        <span>{classroom.status}</span>
                      </div>
                      <div className="classroom-stat-line"><span>{classroom.learnerCount} learners</span><span>{classroom.groupCount} groups</span><span>{classroom.term}</span></div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="directory-loading">No classrooms have been created for your discipline yet.</p>
              )}
            </article>

            <article className="panel review-queue-panel">
              <div className="panel__header"><div><p className="section-label">Teaching scope</p><h2>{dashboard.discipline}</h2></div></div>
              <p className="assignment-builder__copy">New classrooms automatically use your Instructor subrole. The roster accepts only Students with this same subrole.</p>
              <div className="scope-rule"><strong>Instructor</strong><span>{dashboard.discipline}</span></div>
              <div className="scope-rule"><strong>Eligible students</strong><span>{dashboard.discipline}</span></div>
              <p className="account-detail__note">Scenario reviews will appear here after case-assignment tables are added.</p>
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default InstructorOverviewPage;
