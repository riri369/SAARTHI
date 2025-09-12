// src/components/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/Header.css";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Saarthi</h1>
      </div>
      <nav className="header-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/reports">Reports</Link>
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
