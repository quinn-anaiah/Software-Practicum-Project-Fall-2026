import Icon from "../components/Icon";

function StudentCaseDetailPage({
  user,
  selectedCaseId,
  onNavigate,
  studentCases,
  updateCaseStatus,
  studentOrders,
}) {
  const cases = studentCases[user.id] || [];
  const patientCase = cases.find((c) => c.id === selectedCaseId);
  const orders = studentOrders[selectedCaseId] || [];

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

  const statusOrder = [
    "Scheduled",
    "Checked in",
    "Roomed",
    "In progress",
    "Checked out",
  ];

  const statusButtonLabels = {
  Scheduled: "Check In",
  "Checked in": " Mark as Roomed",
  Roomed: "Start Encounter",
  "In progress": "Check Out",
  };

  function advanceStatus() {
    const currentIndex = statusOrder.indexOf(
      patientCase.encounterStatus
    );

    if (
      currentIndex !== -1 &&
      currentIndex < statusOrder.length - 1
    ) {
      const nextStatus = statusOrder[currentIndex + 1];

      updateCaseStatus(
        user.id,
        patientCase.id,
        nextStatus
      );
    }
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
        <dl className="detail-form-grid">
            <div className="detail-field">
                <dt>Age</dt>
                <dd>{patientCase.patientAge}</dd>
            </div>
            <div className="detail-field">
                <dt>Sex</dt>
                <dd>{patientCase.patientSex}</dd>
            </div>
            <div className="detail-field detail-field--wide">
                <dt>Chief complaint</dt>
                <dd>{patientCase.chiefComplaint}</dd>
            </div>
            <div className="detail-field detail-field--wide">
                <dt>History</dt>
                <dd>{patientCase.history}</dd>
            </div>
            <div className="detail-field detail-field--wide">
                <dt>Current medications</dt>
                <dd>
                <ul>
                    {patientCase.medications.map((med) => (
                    <li key={med}>{med}</li>
                    ))}
                </ul>
                </dd>
            </div>
            <div className="detail-field detail-field--wide">
                <dt>Results</dt>
                <dd>{patientCase.results}</dd>
            </div>
            <div className="detail-field">
            <dt>Encounter status</dt>

            <dd className="status-action">
              <span className="status-badge--active">
                {patientCase.encounterStatus}
              </span>

              {patientCase.encounterStatus !== "Checked out" && (
                <button
                  className="primary-button"
                  type="button"
                  onClick={advanceStatus}
                >
                  {statusButtonLabels[patientCase.encounterStatus]}
                </button>
              )}
            </dd>
          </div>

          <div className="detail-field">
            <dt>Note status</dt>

            <dd className="status-action">
              <span className="status-badge--completed">
                {patientCase.noteStatus}
              </span>

              <button
                className="primary-button"
                type="button"
                onClick={() => onNavigate("noteForm")}
              >
                {patientCase.noteStatus === "Not started"
                  ? "Start Note"
                  : "Continue Note"}
              </button>
            </dd>
          </div>
          <div className="detail-field">
          <dt>Orders</dt>

          <dd className="status-action">
            <span>
              {orders.length === 0
                ? "No draft orders"
                : `${orders.length} draft ${
                    orders.length === 1
                      ? "order"
                      : "orders"
                  }`}
            </span>

            <button
              className="primary-button"
              type="button"
              onClick={() => onNavigate("orderEntry")}
            >
              {orders.length === 0
                ? "Add Orders"
                : "Manage Orders"}
            </button>
          </dd>
        </div>
        </dl>

      </section>
    </div>
  );
}

export default StudentCaseDetailPage;
