import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchStudentCases,
  fetchStudentNote,
  fetchStudentOrders,
} from "../lib/api";

function StudentSubmissionPage({ onNavigate }) {
  const [searchParams] = useSearchParams();

  const [patientCase, setPatientCase] = useState(null);
  const [note, setNote] = useState(null);
  const [orders, setOrders] = useState([]);

  const [signatureName, setSignatureName] = useState("");
  const [certified, setCertified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const caseId = searchParams.get("id");

  useEffect(() => {
    let isCurrent = true;

    async function loadSubmission() {
      if (!caseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const cases = await fetchStudentCases();

        if (!isCurrent) return;

        const selectedCase = cases.find(
          (currentCase) =>
            String(currentCase.id) === String(caseId),
        );

        if (!selectedCase) {
          setPatientCase(null);
          return;
        }

        setPatientCase(selectedCase);

        const [savedNote, savedOrders] =
          await Promise.all([
            fetchStudentNote(
              selectedCase.assignment_id,
            ),
            fetchStudentOrders(
              selectedCase.assignment_id,
            ),
          ]);

        if (!isCurrent) return;

        setNote(savedNote);
        setOrders(savedOrders || []);
      } catch (loadError) {
        if (isCurrent) {
          setError(loadError.message);
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadSubmission();

    return () => {
      isCurrent = false;
    };
  }, [caseId]);

  function goBackToCase() {
    onNavigate("caseDetail", {
      caseId: patientCase.id,
    });
  }

    function handleSubmit() {
    onNavigate("caseDetail", {
        caseId: patientCase.id,
    });
    }

  if (loading) {
    return (
      <div className="dashboard-page content-page">
        <p role="status">Loading submission...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page content-page">
        <p role="alert">{error}</p>
      </div>
    );
  }

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

  const formData = note?.content || {};

  const canSubmit =
    Boolean(note) &&
    orders.length > 0 &&
    signatureName.trim() &&
    certified;

  return (
    <div className="dashboard-page content-page">
      <section className="page-heading">
        <div>
          <p className="section-label">
            Submission · {patientCase.id}
          </p>

          <h1>Review & Submit</h1>

          <p>
            {patientCase.patient_name} ·{" "}
            {patientCase.title}
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={goBackToCase}
        >
          Back to case
        </button>
      </section>

      <section className="panel data-panel">
        <div>
          <h2>SOAP Note Review</h2>

          {!note ? (
            <p>No note has been saved for this case.</p>
          ) : (
            <dl className="detail-form-grid">
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
            <p>
              No orders have been entered for this case.
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Order</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_type}</td>

                      <td>{order.order_name}</td>

                      <td>
                        <span className="status-badge">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="panel data-panel">
        <div>
          <h2>Sign & Submit</h2>

          <p>
            Review your SOAP note and orders before
            submitting them to your instructor.
          </p>

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
              I certify that this documentation is
              complete and ready for instructor review.
            </span>
          </label>

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={goBackToCase}
            >
              Cancel
            </button>

            <button
              className="primary-button"
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
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