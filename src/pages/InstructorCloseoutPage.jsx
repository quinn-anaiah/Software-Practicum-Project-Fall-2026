import { useState } from "react";
import Icon from "../components/Icon";
import { learnerActivity, trainingCases } from "../lib/instructorData";

function InstructorCloseoutPage() {
  const [releaseComplete, setReleaseComplete] = useState(false);
  const [archiveMode, setArchiveMode] = useState("archive");
  const terminalStudents = learnerActivity.filter((activity) =>
    ["Completed", "Pending review"].includes(activity.noteStatus),
  ).length;
  return (
    <div className="dashboard-page content-page instructor-page">
      <section className="page-heading">
        <div>
          <p className="section-label">Case closeout</p>
          <h1>Complete the training cycle</h1>
          <p>
            Confirm terminal encounter states, release feedback, then archive or
            recycle scenarios.
          </p>
        </div>
      </section>
      {releaseComplete && (
        <div className="decision-banner">
          <strong>Closeout released to the cohort</strong>
          <span>
            Grades and feedback are visible. Training scenarios are ready for
            the selected disposition.
          </span>
        </div>
      )}
      <section className="closeout-grid">
        <article className="panel terminal-check">
          <p className="section-label">Terminal encounter status</p>
          <h2>
            {terminalStudents} of {learnerActivity.length} learners ready
          </h2>
          <p className="muted-copy">
            All learners must be completed, returned for revision, or otherwise
            closed before cohort release.
          </p>
          <div className="terminal-progress">
            <span
              style={{
                width: `${(terminalStudents / learnerActivity.length) * 100}%`,
              }}
            />
          </div>
          <ul>
            {learnerActivity.map((activity) => (
              <li key={activity.studentId}>
                <span
                  className={
                    activity.noteStatus === "Completed"
                      ? "terminal-dot terminal-dot--done"
                      : "terminal-dot"
                  }
                />{" "}
                {activity.student}
                <strong>{activity.noteStatus}</strong>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel disposition-card">
          <p className="section-label">Scenario disposition</p>
          <h2>What happens to training records?</h2>
          <label>
            <input
              checked={archiveMode === "archive"}
              name="disposition"
              onChange={() => setArchiveMode("archive")}
              type="radio"
            />{" "}
            Archive completed training records
          </label>
          <label>
            <input
              checked={archiveMode === "reset"}
              name="disposition"
              onChange={() => setArchiveMode("reset")}
              type="radio"
            />{" "}
            Reset scenarios for the next cohort
          </label>
          <p>
            {trainingCases.length} training patient scenarios will be{" "}
            {archiveMode === "archive" ? "archived" : "reset for reuse"}.
          </p>
        </article>
      </section>
      <section className="panel release-card">
        <div>
          <p className="section-label">Final release</p>
          <h2>Release grades and feedback</h2>
          <p>
            Once released, the cohort can view final feedback. This demo action
            does not alter any real data.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setReleaseComplete(true)}
          type="button"
        >
          Confirm closeout <Icon name="arrow" size={15} />
        </button>
      </section>
    </div>
  );
}
export default InstructorCloseoutPage;
