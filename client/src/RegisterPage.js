import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AuthPage.css";

const RegisterPage = ({ goToLogin, goToHome }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
   const [appLogo, setAppLogo] = useState(null);
     const [companyName, setCompanyName] = useState("");
   
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 3) {
      setError("Password must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post('http://localhost:5000/api/register', {
        name,
        email,
        password
      });
      alert(response.data.message);

      // Save company settings returned by backend (if any)
      if (response.data.companySettings) {
        console.log("💾 Saving company settings from register response");
        localStorage.setItem("userSettings", JSON.stringify(response.data.companySettings));
        if (response.data.companySettings.logo) setAppLogo(response.data.companySettings.logo);
        if (response.data.companySettings.companyName) setCompanyName(response.data.companySettings.companyName);
      }

      goToHome();
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Load logo/companyName from previously saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.logo) setAppLogo(parsed.logo);
        if (parsed.companyName) setCompanyName(parsed.companyName);
      }
    } catch (e) {
      // ignore
    }
  }, []);
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">CRM Registration</h2>

        {error && (
          <div style={{ 
            color: "red", 
            marginBottom: "10px",
            padding: "8px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px"
          }}>
            {error}
          </div>
        )}
        {appLogo ? <img src={appLogo} alt="logo" className="auth-logo" /> : null}

        <h2 className="auth-title">Create your account</h2>
        {companyName ? <div className="auth-company">{companyName}</div> : null}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />

          <input
            type="password"
            placeholder="Password (min 3 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account?{" "}
          <span onClick={goToLogin} style={{ cursor: "pointer", color: "blue" }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;