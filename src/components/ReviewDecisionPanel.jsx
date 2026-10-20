import { useState } from "react";

// Saves the instructor's decision. Calls the review route directly, because
// the review page's own request helper only sends GET requests.
async function submitReview(assignmentId, decision, comments) {
  const accessToken = sessionStorage.getItem("careflow-access-token");
  if (!accessToken) {
    throw new Error("No active session. Please sign in again.");
  }

  const response = await fetch(
    `/api/instructor/submissions/${encodeURIComponent(assignmentId)}/review`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision, comments }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Unable to save your review.");
  }
  return payload;
}

function ReviewDecisionPanel({ assignmentId, status, onReviewed }) {
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

// Only a submitted note can be reviewed
if (status !== "Pending Review" && !message) return null;

  async function decide(decision) {
    if (decision === "Returned" && !comments.trim()) {
      setError("Add feedback explaining what the student should revise.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const result = await submitReview(assignmentId, decision, comments);
      setMessage(result.message);
      setComments("");
      if (onReviewed) onReviewed(result.note);
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setSaving(false);
    }
  }

  const canReview = status === "Pending Review";

  return (
    <section className="panel data-panel review-decision">
      <p className="section-label">Review decision</p>
      <h2>Feedback for the student</h2>

            {canReview && (
            <div className="review-field block">
            <label htmlFor="review-comments">
                Comments <span className="review-field__hint">(required when returning)</span>
            </label>
            <textarea
                id="review-comments"
                maxLength={2000}
                onChange={(event) => setComments(event.target.value)}
                placeholder="Explain what the student did well and what to revise."
                rows={5}
                value={comments}
            />
          <span className="review-field__count">{comments.length} / 2000</span>
        </div>
      )}

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

            {canReview && (
                <div className="form-actions review-decision__actions">
                <button
                    className="secondary-button"
                    disabled={saving}
                    onClick={() => decide("Returned")}
                    type="button"
                >
                    Return for revision
                </button>
                <button
                    className="primary-button"
                    disabled={saving}
                    onClick={() => decide("Approved")}
                    type="button"
                >
                    Approve
                </button>
                </div>
      )}
    </section>
  );
}
export default ReviewDecisionPanel;