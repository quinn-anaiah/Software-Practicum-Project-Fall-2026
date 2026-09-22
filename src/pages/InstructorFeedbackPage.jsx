import { useState } from "react";
import Icon from "../components/Icon";
import { instructorExpectations, submittedWork } from "../lib/instructorData";

function InstructorFeedbackPage({ onNavigate }) {
  const [released, setReleased] = useState(false);
  const [feedback, setFeedback] = useState(
    "Strong assessment of medication-related dizziness. Add a specific follow-up timeframe and explicitly identify the NSAID interaction.",
  );
  const score = 82;
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Feedback & grading</p>
          <h1>Score {submittedWork.student}’s case</h1>
          <p>
            Use the published rubric, annotate the work, and release feedback
            when ready.
          </p>
        </div>
        <button
          className="outline-button"
          onClick={() => onNavigate("review")}
          type="button"
        >
          Open submitted work
        </button>
      </section>
      {released && (
        <div className="decision-banner">
          <strong>Feedback and grade released</strong>
          <span>
            The learner can now view the rubric score and instructor comments.
          </span>
        </div>
      )}
      <section className="grading-layout">
        <article className="panel rubric-score-card">
          <div className="score-circle">
            <strong>{score}</strong>
            <span>/ 100</span>
          </div>
          <div>
            <p className="section-label">Current score</p>
            <h2>Proficient with revisions</h2>
            <p className="muted-copy">
              The final score remains provisional until the co-signature is
              complete.
            </p>
          </div>
        </article>
        <article className="panel rubric-score-table">
          <p className="section-label">Rubric scoring</p>
          {instructorExpectations.rubric.map((criterion, index) => (
            <div key={criterion.criterion}>
              <span>
                {criterion.criterion}
                <small>{criterion.weight}</small>
              </span>
              <strong>
                {[30, 26, 18, 8][index]} / {[35, 30, 25, 10][index]}
              </strong>
            </div>
          ))}
        </article>
      </section>
      <section className="panel feedback-card">
        <label>
          Instructor feedback
          <textarea
            onChange={(event) => setFeedback(event.target.value)}
            value={feedback}
          />
        </label>
        <div className="review-actions">
          <button className="outline-button" type="button">
            Save draft
          </button>
          <button
            className="primary-button"
            onClick={() => setReleased(true)}
            type="button"
          >
            Release feedback <Icon name="arrow" size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
export default InstructorFeedbackPage;
