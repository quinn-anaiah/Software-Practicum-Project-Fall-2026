import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { completePasswordSetup } from "../lib/api";

function PasswordSetupPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const query = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = query.get("access_token");
  const refreshToken = query.get("refresh_token");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await completePasswordSetup({ accessToken, refreshToken, password });
      navigate("/login?password-set=1", { replace: true });
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Unable to set your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__aside">
        <div className="login-brand"><span className="brand-mark">+</span> Careflow</div>
        <div className="login-page__message">
          <p className="section-label">Secure account setup</p>
          <h1>Choose a password for your Careflow account.</h1>
          <p>Your invitation is linked to a one-time secure setup session.</p>
        </div>
      </section>
      <section className="login-page__form-area">
        <div className="login-card">
          <p className="section-label">Account invitation</p>
          <h2>Set your password</h2>
          <p className="login-card__intro">Use at least eight characters. This page never displays your password.</p>
          {!accessToken || !refreshToken ? (
            <p className="login-error">This invitation link is incomplete or has expired. Ask an administrator to send a new invitation.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>Password<input autoComplete="new-password" minLength="8" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
              <label>Confirm password<input autoComplete="new-password" minLength="8" onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} /></label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="login-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Set password"}</button>
            </form>
          )}
          <p className="login-card__footer"><Link to="/login">Return to sign in</Link></p>
        </div>
      </section>
    </main>
  );
}

export default PasswordSetupPage;
