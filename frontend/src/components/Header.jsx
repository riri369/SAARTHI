import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Styles/Header.css";

export default function Header({ user, onLogout, logoComponent }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Redirect to login page on logout
  };

  return (
    <header className="header">
      <div className="header-left">
        {logoComponent ? logoComponent : <h1 className="logo">Saarthi</h1>}
      </div>

      <nav className="header-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          Reports
        </NavLink>
      </nav>

      <div className="header-right">
        {user && <span className="welcome">Hi, {user}</span>}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
