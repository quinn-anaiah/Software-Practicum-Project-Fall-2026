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
          <p>
            No cases assigned yet. Check back once your instructor assigns one.
          </p>
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
