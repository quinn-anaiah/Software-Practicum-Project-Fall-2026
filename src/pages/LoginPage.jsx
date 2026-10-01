import { useEffect, useState } from "react";
import { authenticate } from "../lib/auth";
import RegisterPage from "./RegisterPage";
import { fetchRoles } from "../lib/api";

function describeSupabaseError(error) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const databaseError = error;
    return [
      databaseError.code,
      databaseError.message,
      databaseError.details,
      databaseError.hint,
    ]
      .filter(Boolean)
      .join(" — ");
  }

  return String(error || "Unknown Supabase error");
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("dr.rivera@careflow.test");
  const [password, setPassword] = useState("Careflow2026!");
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesStatus, setRolesStatus] = useState("loading");
  const [rolesError, setRolesError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadRoles() {
      try {
        const roleRows = await fetchRoles();
        if (isCurrent) {
          setRoles(roleRows);
          setRolesStatus("ready");
        }
      } catch (fetchError) {
        if (isCurrent) {
          setRolesError(describeSupabaseError(fetchError));
          setRolesStatus("error");
        }
      }
    }

    loadRoles();
    return () => {
      isCurrent = false;
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const user = authenticate(email, password);

    if (!user) {
      setError("That email or password does not match a demo account.");
      return;
    }

    onLogin(user);
  }
  if (showRegister) {
    return (
      <RegisterPage 
        onRegister={onLogin} 
        onSwitchToLogin={() => setShowRegister(false)} 
      />
    );
  }


  return (
    <main className="login-page">
      <section className="login-page__aside">
        <div className="login-brand">
          <span className="brand-mark">+</span> Careflow
        </div>
        <div className="login-page__message">
          <div className="team-no">
            <p>
              Team 4:<br></br>
              Anaiah Quinn<br></br>
              Christian Revilla<br></br>
              Derek Gamboa<br></br>
              Francisco Vazquez<br></br>
              Scrum Master Sprint1: Jazmin Huerta
            </p>
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
            <button className="signup" type="button" onClick={() => setShowRegister(true)}> {/**Should trigger to register page not dashboard like it currentlyy does */}
              Sign Up <span>→</span>
            </button>
          </form>
          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <span>Student: javier.lopez@careflow.test</span>
            <span>Password: Student123!</span>
            <hr></hr>
            <span>Instructor: dr.rivera@careflow.test</span>
            <span>Password: Careflow2026!</span>
            <hr></hr>
            <span>Patient: morgan.lee@careflow.test</span>
            <span>Password: Welcome123!</span>
          </div>
          <section className="database-status" aria-live="polite">
            <strong>Supabase role lookup</strong>
            {rolesStatus === "loading" && <span>Loading roles…</span>}
            {rolesStatus === "ready" && (
              <div className="database-status__roles">
                {roles.map((role) => (
                  <span key={role.id}>{role.name}</span>
                ))}
              </div>
            )}
            {rolesStatus === "error" && (
              <>
                <span>
                  Unable to read roles. Confirm that the roles are seeded and
                  the read policy below has been created.
                </span>
                <code>{rolesError}</code>
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
