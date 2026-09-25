import { useState } from "react";
import { authenticate } from "../lib/auth";

function RegisterPage({ onRegister, onSwitchToLogin }) {
    const [firstName, setFirstName]  = useState("")
    const [lastName, setLastName]  = useState("")
    const [utepID, setUtepID] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("");
    const [role, setRole] = useState("Default")

    const roles = [ 'Student', 'Patient', 'Default'] //default is a placeholder til instructor or admin permissions are granted

    //separate function to handle password strength logic
    //assign user ids, incrementaly 
    function handleRegisterSubmit(event) {
    event.preventDefault();
    
    setError("");
    // Check that password matches confirmed password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Optional: Add basic password strength check
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    // Create a mock user object (or handle your registration logic)
    const newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      utepId: role === "Student" ? utepID : null,
      role: role, // default role or let them choose
      password: password
    };
    // check password strength
    //check that password matches confirmed password
  


    onRegister(newUser); //this on register should equal the handleRegister function from app.jsx, which we will pass through the loginPage, then pass that to registerpage
  }

  return (
    <main className="login-page">
      
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
              First Name
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
            <label>
               Select Role
               <select
                name="role"
                onChange={(e) => setRole(e.target.value)}
                value={role}
                >
                    {roles.map((role)=> (
                        <option key={role}>{role}</option>
                    ))}
                </select>
            </label>
            {/* Conditionally renders UTEP ID only when role is Student */}
            {role === "Student" && (
              <label>
                UTEP ID
                <input
                  type="text"
                  value={utepID}
                  onChange={(e) => setUtepID(e.target.value)}
                  placeholder="e.g., 80123456"
                  required={role === "Student"}
                />
              </label>
            )}
            
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
             <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}


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