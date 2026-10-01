import { useState } from "react";

function StudentSubmissionPage({
  user,
  selectedCaseId,
  onNavigate,
  studentCases,
  studentNotes,
  studentOrders,
  submitStudentWork,
}) {
  const cases = studentCases[user.id] || [];

  const patientCase = cases.find(
    (c) => c.id === selectedCaseId
  );

  const note = studentNotes[selectedCaseId];
  const orders = studentOrders[selectedCaseId] || [];

  const formData = note?.formData || {};

  const [signatureName, setSignatureName] = useState("");
  const [certified, setCertified] = useState(false);

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
          <p className="section-label">
            Submission · {patientCase.id}
          </p>

          <h1>Submit for Review</h1>

          <p>{patientCase.patientName}</p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => onNavigate("caseDetail")}
        >
          Back
        </button>
      </section>

      <section className="panel data-panel">
        <div>
          <h2>Note Review</h2>

          {!note ? (
            <p>No note has been saved for this case.</p>
          ) : (
            <dl className="detail-form-grid">
              <div className="detail-field detail-field--wide">
                <dt>Template</dt>
                <dd>
                  {note.templateType === "soap"
                    ? "SOAP Note"
                    : note.templateType}
                </dd>
              </div>

              <div className="detail-field detail-field--wide">
                <dt>Subjective</dt>
                <dd>
                  {formData.subjective ||
                    "No information entered."}
                </dd>
              </div>

              <div className="detail-field detail-field--wide">
                <dt>Objective</dt>
                <dd>
                  {formData.objective ||
                    "No information entered."}
                </dd>
              </div>

              <div className="detail-field detail-field--wide">
                <dt>Assessment</dt>
                <dd>
                  {formData.assessment ||
                    "No information entered."}
                </dd>
              </div>

              <div className="detail-field detail-field--wide">
                <dt>Plan</dt>
                <dd>
                  {formData.plan ||
                    "No information entered."}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </section>

      <section className="panel data-panel">
        <div>
          <h2>Order Review</h2>

          {orders.length === 0 ? (
            <p>No orders have been entered for this case.</p>
          ) : (
            <dl className="detail-form-grid">
              {orders.map((order, index) => (
                <div
                  className="detail-field detail-field--wide"
                  key={order.id || index}
                >
                  <dt>Order {index + 1}</dt>

                  <dd>
                    <p>
                      <strong>Type:</strong>{" "}
                      {order.type}
                    </p>

                    <p>
                      <strong>Description:</strong>{" "}
                      {order.name}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="panel data-panel">
        <div>
          <h2>Sign & Submit</h2>

          <div className="detail-form-grid">
            <div className="detail-field detail-field--wide">
              <dt>Electronic Signature</dt>

              <dd>
                <input
                  id="electronicSignature"
                  type="text"
                  value={signatureName}
                  onChange={(event) =>
                    setSignatureName(event.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </dd>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              id="studentCertification"
              checked={certified}
              onChange={(event) =>
                setCertified(event.target.checked)
              }
            />

            <span>
              I certify that this documentation is complete
              and ready for instructor review.
            </span>
          </label>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => onNavigate("caseDetail")}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="button"
              disabled={
                !signatureName.trim() || !certified
              }
              onClick={() => {
                submitStudentWork(
                    user.id,
                    patientCase.id,
                    signatureName.trim()
                );

                onNavigate("caseDetail");

              }}
            >
              Sign & Submit for Review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentSubmissionPage;