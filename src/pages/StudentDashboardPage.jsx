import Icon from "../components/Icon";

function StudentDashboardPage({
  user,
  onNavigate,
  setSelectedCaseId,
  studentCases,
}) {
  const cases = studentCases[user.id] || [];

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">My cases</p>
          <h1>Welcome back, {user.name.split(" ")[0]}</h1>
          <p>Review your assigned patient scenarios and documentation.</p>
        </div>
      </section>

      <section className="panel data-panel">
        {cases.length === 0 ? (
          <div className="student-empty-state">
            <p className="section-label">Account ready</p>
            <h2>Your learning workspace is set up.</h2>
            <p>
              You do not have a training case yet. Your instructor will assign
              cases and documentation requirements to this page.
            </p>
            <div className="student-empty-state__steps">
              <span>1. Confirm your account details</span>
              <span>2. Wait for an assigned scenario</span>
              <span>3. Start your encounter and note</span>
            </div>
            <button
              className="outline-button"
              onClick={() => onNavigate("settings")}
              type="button"
            >
              Review account settings <Icon name="arrow" size={15} />
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Chief complaint</th>
                  <th>Encounter status</th>
                  <th>Note status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.patientName}</strong>
                      <small>{c.id}</small>
                    </td>
                    <td>{c.chiefComplaint}</td>
                    <td>
                      <span className="status-badge">{c.encounterStatus}</span>
                    </td>
                    <td>
                      <span className="status-badge">{c.noteStatus}</span>
                    </td>
                    <td>
                      <button
                        aria-label={`Open case ${c.patientName}`}
                        className="row-action"
                        type="button"
                        onClick={() => {
                          setSelectedCaseId(c.id);
                          onNavigate("caseDetail");
                        }}
                      >
                        <Icon name="arrow" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default StudentDashboardPage;
