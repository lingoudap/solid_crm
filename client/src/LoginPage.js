// client/src/LoginPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AuthPage.css";

const LoginPage = ({ goToRegister, goToHome }) => {
  const [email, setemail] = useState("");   // changed from username
  const [password, setPassword] = useState("");
  const [appLogo, setAppLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      // Optional token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Save company settings from backend
      if (res.data.companySettings) {
        console.log("💾 Saving company settings from login response");
        localStorage.setItem("userSettings", JSON.stringify(res.data.companySettings));
        if (res.data.companySettings.logo) setAppLogo(res.data.companySettings.logo);
        if (res.data.companySettings.companyName) setCompanyName(res.data.companySettings.companyName);
      }

      goToHome();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
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
        {appLogo ? (
          <img src={appLogo} alt="logo" className="auth-logo" />
        ) : null}

        <h2 className="auth-title">CRM Login</h2>
        {companyName ? <div style={{ color: "#6b7280", marginBottom: 10 }}>{companyName}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className="auth-input"
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            autoComplete="current-password"
          />

          {error && <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch-text">
          Don't have an account? <span onClick={goToRegister}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
