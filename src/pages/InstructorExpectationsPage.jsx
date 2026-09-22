import Icon from "../components/Icon";
import { instructorExpectations } from "../lib/instructorData";

function InstructorExpectationsPage({ onNavigate }) {
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Defining expectations</p>
          <h1>Rubric and safety checks</h1>
          <p>
            Set what learners must document, where supervision is required, and
            what they need to catch.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => onNavigate("monitoring")}
          type="button"
        >
          Publish expectations <Icon name="arrow" size={15} />
        </button>
      </section>
      <section className="expectations-grid">
        <article className="panel">
          <p className="section-label">Assessment rubric</p>
          <h2>How the case is evaluated</h2>
          <div className="rubric-list">
            {instructorExpectations.rubric.map((item) => (
              <div key={item.criterion}>
                <span>{item.weight}</span>
                <div>
                  <h3>{item.criterion}</h3>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <p className="section-label">Required documentation</p>
          <h2>SOAP note checklist</h2>
          <ul className="check-list">
            {instructorExpectations.requiredDocumentation.map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
          <div className="cosign-card">
            <span>Co-signature</span>
            <strong>{instructorExpectations.coSignature}</strong>
          </div>
        </article>
      </section>
      <section className="panel traps-panel">
        <div>
          <p className="section-label">Deliberate safety traps</p>
          <h2>Items learners must recognize</h2>
          <p className="muted-copy">
            These remain visible in the case but are not called out to learners.
          </p>
        </div>
        <div>
          {instructorExpectations.traps.map((trap) => (
            <article key={trap.label}>
              <span>!</span>
              <div>
                <h3>{trap.label}</h3>
                <p>{trap.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
export default InstructorExpectationsPage;
