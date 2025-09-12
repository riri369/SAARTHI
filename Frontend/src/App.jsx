import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ReportPage from "./pages/ReportPage";
import Header from "./components/Header";
import "./App.css";

function App() {
  // Centralized employee database
  const employees = {
    E001: "Ananya Gupta",
    E002: "Vikram Singh",
    E003: "Meena Nair",
  };

  const [user, setUser] = useState(null);

  // Login handler receives employeeId and password
  const handleLogin = (employeeId, password) => {
    // Simple password check: '1234'
    if (employees[employeeId] && password === "1234") {
      // Set user state as employee name
      setUser(employees[employeeId]);
      localStorage.setItem("saarthiUser", employees[employeeId]);
      return { success: true };
    } else {
      return { success: false, error: "Invalid Employee ID or Password" };
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("saarthiUser");
  };

  return (
    <Router>
      {user && <Header user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/"
          element={
            !user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/dashboard"
          element={user ? <AdminDashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/reports"
          element={user ? <ReportPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
