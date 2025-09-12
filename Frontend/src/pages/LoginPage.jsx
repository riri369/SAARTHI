import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onLogin(employeeId, password);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-content">
          <h1 className="login-title">SAARTHI</h1>
          <div className="login-form-header">
            <h2 className="login-heading">Log In</h2>
            <p className="login-subtext">
              Welcome back! Please log in to your account.
            </p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-label">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter your employee ID"
              className="login-input"
              required
              pattern="[a-zA-Z0-9]+"
              title="Employee ID should contain only letters and digits."
            />
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Log In
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
