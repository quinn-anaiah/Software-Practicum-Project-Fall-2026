import { useState } from "react";
import Icon from "../components/Icon";
import { submittedWork } from "../lib/instructorData";

function InstructorReviewPage({ onNavigate, user }) {
  const [decision, setDecision] = useState("");
  const [attested, setAttested] = useState(false);

  function coSign() {
    setAttested(true);
    setDecision("Co-signed and finalized");
  }

  function returnForRevision() {
    setAttested(false);
    setDecision("Returned to learner for revision");
  }

  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Review & co-signature</p>
          <h1>{submittedWork.student}’s submitted work</h1>
          <p>
            {submittedWork.caseTitle} · submitted {submittedWork.submittedAt}
          </p>
        </div>
        <button
          className="outline-button"
          onClick={() => onNavigate("monitoring")}
          type="button"
        >
          Back to monitor
        </button>
      </section>
      {decision && (
        <div className="decision-banner">
          <strong>{decision}</strong>
          <span>
            {attested
              ? `Attested by ${user.name}`
              : "The submission is now available to the student again."}
          </span>
        </div>
      )}
      <section className="review-layout">
        <article className="panel submitted-note">
          <div className="panel__header">
            <div>
              <p className="section-label">Student note</p>
              <h2>SOAP documentation</h2>
            </div>
            <span className="status-badge status-badge--pending">
              Pending review
            </span>
          </div>
          <NoteSection
            title="Subjective"
            value={submittedWork.note.subjective}
          />
          <NoteSection
            title="Assessment"
            value={submittedWork.note.assessment}
          />
          <NoteSection title="Plan" value={submittedWork.note.plan} />
        </article>
        <aside className="review-sidebar">
          <article className="panel order-review">
            <p className="section-label">Mock orders</p>
            <h2>Safety review</h2>
            {submittedWork.mockOrders.map((order, index) => (
              <div
                className={
                  index === 1 ? "order-item order-item--flagged" : "order-item"
                }
                key={order}
              >
                <span>{index === 1 ? "!" : "✓"}</span>
                <p>{order}</p>
              </div>
            ))}
            <p className="review-hint">
              The ibuprofen order is a deliberate interaction check. Confirm the
              learner addressed the blood-pressure risk.
            </p>
          </article>
          <article className="panel attestation-card">
            <p className="section-label">Instructor attestation</p>
            <label>
              <input
                checked={attested}
                onChange={(event) => setAttested(event.target.checked)}
                type="checkbox"
              />{" "}
              I reviewed the trainee note and mock orders.
            </label>
            <p>Co-signature authority finalizes the training encounter.</p>
          </article>
        </aside>
      </section>
      <section className="review-actions">
        <button
          className="outline-button"
          onClick={returnForRevision}
          type="button"
        >
          Return for revision
        </button>
        <button
          className="primary-button"
          disabled={!attested}
          onClick={coSign}
          type="button"
        >
          Co-sign & finalize <Icon name="arrow" size={15} />
        </button>
      </section>
    </div>
  );
}
function NoteSection({ title, value }) {
  return (
    <section className="note-section">
      <h3>{title}</h3>
      <p>{value}</p>
    </section>
  );
}
export default InstructorReviewPage;
