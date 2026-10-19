import { useEffect, useState } from "react";
import { fetchPatientDashboard } from "../lib/api";

function PatientOverviewPage({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    async function loadDashboard() {
      try {
        const result = await fetchPatientDashboard();
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
        { label: "Active medications", value: dashboard.metrics.activeMedications, note: "Current prescriptions", tone: "indigo" },
        { label: "Upcoming visits", value: dashboard.metrics.upcomingAppointments, note: "Scheduled appointments", tone: "teal" },
        { label: "Clinical alerts", value: dashboard.metrics.unreadUpdates, note: "Unread updates", tone: "amber" },
      ]
    : [];

  return (
    <div className="dashboard-page content-page instructor-workspace">
      <section className="page-heading">
        <div>
          <p className="section-label">My health · overview</p>
          <h1>Good afternoon, {firstName}</h1>
          <p>Review your diagnoses, active prescriptions, and upcoming care visits.</p>
        </div>
      </section>

      {error && <section className="panel directory-error">{error}</section>}
      {!dashboard && !error && <section className="panel directory-loading">Loading your health portal…</section>}

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
                <div><p className="section-label">Treatments</p><h2>Current Medications</h2></div>
                <span className="directory-live-indicator">● Live database</span>
              </div>
              {dashboard.medications.length ? (
                <div className="classroom-health-list">
                  {dashboard.medications.map((med) => (
                    <article key={med.id}>
                      <div className="classroom-health-list__heading">
                        <div><h3>{med.medication_name}</h3><p>{med.dosage} · {med.frequency}</p></div>
                        <span>{med.status}</span>
                      </div>
                      <div className="classroom-stat-line"><span>Prescribed by: {med.prescribed_by || "Provider"}</span></div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="directory-loading">No active medications found.</p>
              )}
            </article>

            <article className="panel review-queue-panel">
              <div className="panel__header"><div><p className="section-label">Diagnoses</p><h2>Medical History</h2></div></div>
              {dashboard.medicalHistory.length ? (
                <div className="classroom-health-list">
                  {dashboard.medicalHistory.map((item) => (
                    <article key={item.id} style={{ marginBottom: "12px" }}>
                      <strong>{item.condition_name}</strong>
                      <p><small>Status: {item.status} · Diagnosed: {item.diagnosed_date || "N/A"}</small></p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="directory-loading">No medical history records found.</p>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export default PatientOverviewPage;