import Icon from "../components/Icon";
import { adminPatients } from "../lib/adminData";

function AdminPatientsPage() {
  return (
    <div className="dashboard-page content-page">
      <PageHeading
        eyebrow="Patient directory"
        title="Patients"
        description="Search, review, and manage the people in your practice."
        action="Add patient"
      />
      <section className="panel data-panel">
        <div className="data-panel__toolbar">
          <strong>{adminPatients.length} patients</strong>
          <label className="table-search">
            <Icon name="search" size={16} />
            <input placeholder="Search patients" type="search" />
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Provider</th>
                <th>Last visit</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {adminPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <span
                      className={`patient-avatar patient-avatar--${patient.color}`}
                    >
                      {patient.initials}
                    </span>
                    <span>
                      <strong>{patient.name}</strong>
                      <small>{patient.id}</small>
                    </span>
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.provider}</td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <span
                      className={`status-badge status-badge--${patient.status.toLowerCase()}`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td>
                    <button
                      aria-label={`Open ${patient.name}`}
                      className="row-action"
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

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <section className="page-heading">
      <div>
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <button className="primary-button" type="button">
        <Icon name="plus" size={18} /> {action}
      </button>
    </section>
  );
}
export default AdminPatientsPage;
