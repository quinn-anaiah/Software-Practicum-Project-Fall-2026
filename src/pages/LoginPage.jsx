import { useState } from "react";
import { authenticate } from "../lib/auth";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("dr.rivera@careflow.test");
  const [password, setPassword] = useState("Careflow2026!");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const user = authenticate(email, password);

    if (!user) {
      setError("That email or password does not match a demo account.");
      return;
    }

    onLogin(user);
  }

  return (
    <main className="login-page">
      <section className="login-page__aside">
        <div className="login-brand">
          <span className="brand-mark">+</span> Careflow
        </div>
        <div className="login-page__message">
          <p className="section-label">Connected care, simplified</p>
          <h1>Built for the people behind better care.</h1>
          <p>
            One calm workspace for your practice, your patients, and every
            moment in between.
          </p>
          <div className="login-quote">
            <span>“</span>
            <p>
              Careflow keeps our day organized, so we can focus more fully on
              our patients.
            </p>
            <strong>— Dr. Amara Shah</strong>
          </div>
        </div>
      </section>
      <section className="login-page__form-area">
        <div className="login-card">
          <p className="section-label">Welcome back</p>
          <h2>Sign in to Careflow</h2>
          <p className="login-card__intro">
            Use one of the local demo accounts to enter the dashboard.
          </p>
          <form onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" type="submit">
              Sign in to dashboard <span>→</span>
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <span>Admin · dr.rivera@careflow.test</span>
            <span>Patient · morgan.lee@careflow.test</span>
            <span>Passwords: Careflow2026! / Welcome123!</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
