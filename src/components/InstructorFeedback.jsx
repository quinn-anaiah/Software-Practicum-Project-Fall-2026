function InstructorFeedback({ feedback }) {
  if (!feedback) return null;

  return (
    <section aria-label="Instructor feedback" className="panel data-panel">
      <p className="section-label">Instructor feedback</p>
      <h2>
        {feedback.decision === "Returned" ? "Returned for revision" : "Approved"}
      </h2>
      <p className="feedback-date">
        {new Date(feedback.created_at).toLocaleDateString()}
      </p>
      <p className="feedback-comments">
        {feedback.comments || "No comments were added."}
      </p>
    </section>
  );
}

export default InstructorFeedback;