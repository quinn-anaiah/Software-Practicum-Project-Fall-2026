import { useState } from "react";
import { authenticate } from "../lib/auth";

function RegisterPage({ onregister, onSwitchToLogin }) {
    const [name, setName]  = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmedPassword] = useState("")
    const [error, setError] = useState("");
    const [role, setRole] = useState("student")

    const roles = [ 'Student', 'Patient', 'Defaults'] //default is a placeholder til instructor or admin permissions are granted

  function handleRegisterSubmit(event) {
    event.preventDefault();
    
    // Create a mock user object (or handle your registration logic)
    const newUser = {
      name: name,
      email: email,
      role: "Student", // default role or let them choose
    };

    // Automatically log them in using App.jsx's handleLogin function passed down via onRegister
    onRegister(newUser);
  }

  return (
    <main className="login-page">
      {/* You can share the exact same .login-page__aside styling/branding */}
      <section className="login-page__aside">
        <div className="login-brand">
          <span className="brand-mark">+</span> Careflow
        </div>
      </section>

      <section className="login-page__form-area">
        <div className="login-card">
          <p className="section-label">Get started</p>
          <h2>Create a Careflow Account</h2>
          
          <form onSubmit={handleRegisterSubmit}>
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button className="login-submit" type="submit">
              Register & Sign In <span>→</span>
            </button>
            
            <button 
              className="signup" 
              type="button" 
              onClick={onSwitchToLogin}
            > 
              ← Back to Sign In
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;