import Icon from "../components/Icon";
import { studentCases } from "../lib/studentData";

function StudentCaseDetailPage({ user, selectedCaseId, onNavigate }) {
  const cases = studentCases[user.id] || [];
  const patientCase = cases.find((c) => c.id === selectedCaseId);

  if (!patientCase) {
    return (
      <div className="dashboard-page content-page">
        <p>No case selected.</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          Back to my cases
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Assigned case · {patientCase.id}</p>
          <h1>{patientCase.patientName}</h1>
          <p>Assigned by {patientCase.assignedBy}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("overview")}
        >
          <Icon name="arrow" size={16} /> Back
        </button>
      </section>

      <section className="panel data-panel">
        <dl className="detail-list">
          <div>
            <dt>Age</dt>
            <dd>{patientCase.patientAge}</dd>
          </div>
          <div>
            <dt>Sex</dt>
            <dd>{patientCase.patientSex}</dd>
          </div>
          <div>
            <dt>Chief complaint</dt>
            <dd>{patientCase.chiefComplaint}</dd>
          </div>
          <div>
            <dt>History</dt>
            <dd>{patientCase.history}</dd>
          </div>
          <div>
            <dt>Current medications</dt>
            <dd>
              <ul>
                {patientCase.medications.map((med) => (
                  <li key={med}>{med}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Results</dt>
            <dd>{patientCase.results}</dd>
          </div>
          <div>
            <dt>Encounter status</dt>
            <dd>
              <span className="status-badge">
                {patientCase.encounterStatus}
              </span>
            </dd>
          </div>
          <div>
            <dt>Note status</dt>
            <dd>
              <span className="status-badge">{patientCase.noteStatus}</span>
            </dd>
          </div>
        </dl>
        <div className="form-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => onNavigate("noteForm")}
          >
            Start SOAP note
          </button>
        </div>
      </section>
    </div>
  );
}

export default StudentCaseDetailPage;
