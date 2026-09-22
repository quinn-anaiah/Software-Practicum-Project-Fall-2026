import Icon from "../components/Icon";

function AdminPatientInfoPage({ patients, selectedPatientId, onNavigate }) {
  const patient = patients.find((p) => p.id === selectedPatientId);

  if (!patient) {
    return (
      <div className="dashboard-page content-page">
        <p>No patient selected.</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("patients")}
        >
          Back to patients
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Patient directory</p>
          <h1>{patient.name}</h1>
          <p>Patient ID: {patient.id}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("patients")}
        >
          <Icon name="arrow" size={16} /> Back
        </button>
      </section>

      <section className="panel data-panel">
        <dl className="detail-list">
          <div>
            <dt>Age</dt>
            <dd>{patient.age}</dd>
          </div>
          <div>
            <dt>Provider</dt>
            <dd>{patient.provider}</dd>
          </div>
          <div>
            <dt>Last visit</dt>
            <dd>{patient.lastVisit}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span
                className={`status-badge status-badge--${patient.status.toLowerCase()}`}
              >
                {patient.status}
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default AdminPatientInfoPage;
