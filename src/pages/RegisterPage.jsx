import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../lib/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  utepId: "",
  password: "",
  confirmPassword: "",
  accountType: "Student",
};

function formatEmailPart(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function createCareflowEmail(firstName, lastName) {
  const first = formatEmailPart(firstName);
  const last = formatEmailPart(lastName);
  return first && last ? `${first}.${last}@careflow.test` : "";
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: value };

      if (name === "firstName" || name === "lastName") {
        nextForm.email = createCareflowEmail(
          nextForm.firstName,
          nextForm.lastName,
        );
      }

      return nextForm;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.email.trim().toLowerCase().endsWith("@careflow.test")) {
      setError("Use an email address ending in @careflow.test.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        utepId: form.utepId,
        accountType: form.accountType,
      });
      navigate("/login?registered=1", { replace: true });
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__aside">
        <div className="login-brand">
          <span className="brand-mark">+</span> Careflow
        </div>
        <div className="login-page__message">
          <p className="section-label">Learning care, together</p>
          <h1>Start your Careflow learning workspace.</h1>
          <p>
            Your account begins as a Student profile. An administrator can
            update your access and discipline after registration.
          </p>
        </div>
      </section>
      <section className="login-page__form-area">
        <div className="login-card register-card">
          <p className="section-label">Create account</p>
          <h2>Join Careflow</h2>
          <p className="login-card__intro">
            Create a learning or patient profile with your Careflow information.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="register-form__grid">
              <label>
                First name
                <input
                  autoComplete="given-name"
                  name="firstName"
                  onChange={updateField}
                  required
                  value={form.firstName}
                />
              </label>
              <label>
                Last name
                <input
                  autoComplete="family-name"
                  name="lastName"
                  onChange={updateField}
                  required
                  value={form.lastName}
                />
              </label>
            </div>
            <fieldset className="account-type-selector">
              <legend>Account type</legend>
              <p>Admin and Instructor access can only be assigned by an administrator.</p>
              <div>
                <label>
                  <input
                    checked={form.accountType === "Student"}
                    name="accountType"
                    onChange={updateField}
                    type="radio"
                    value="Student"
                  />
                  <span>
                    <strong>Student</strong>
                    <small>Access learning cases and coursework.</small>
                  </span>
                </label>
                <label>
                  <input
                    checked={form.accountType === "Patient"}
                    name="accountType"
                    onChange={updateField}
                    type="radio"
                    value="Patient"
                  />
                  <span>
                    <strong>Patient</strong>
                    <small>Access a personal care portal.</small>
                  </span>
                </label>
              </div>
            </fieldset>
            <label>
              UTEP ID <span className="field-optional">Optional</span>
              <input
                autoComplete="off"
                name="utepId"
                onChange={updateField}
                placeholder="e.g. 80123456"
                value={form.utepId}
              />
            </label>
            <label>
              Email address
              <input
                autoComplete="email"
                aria-describedby="generated-email-help"
                name="email"
                pattern="[^@\\s]+@careflow\\.test"
                required
                readOnly
                type="email"
                value={form.email}
              />
              <small className="generated-email-help" id="generated-email-help">
                Generated from your first and last name.
              </small>
            </label>
            <div className="register-form__grid">
              <label>
                Password
                <input
                  autoComplete="new-password"
                  minLength="8"
                  name="password"
                  onChange={updateField}
                  required
                  type="password"
                  value={form.password}
                />
              </label>
              <label>
                Confirm password
                <input
                  autoComplete="new-password"
                  minLength="8"
                  name="confirmPassword"
                  onChange={updateField}
                  required
                  type="password"
                  value={form.confirmPassword}
                />
              </label>
            </div>
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? "Creating your account…"
                : `Create ${form.accountType} account`}
              <span>→</span>
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
