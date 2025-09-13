import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ReportPage from "./pages/ReportPage";
import Home from "./pages/Home";               // Issue summary page
import IssueDetail from "./pages/IssueDetail"; // Selected issue details
import Issues from "./pages/Issues";           // Columnar issues page
import PotholeDetail from "./pages/PotholeDetail"; // Pothole detail page
import Header from "./components/Header";
import SaarthiLogo from "./components/logo"; // Your logo component
import "./App.css";

function App() {
  const employees = {
    E001: "Ananya Gupta",
    E002: "Vikram Singh",
    E003: "Meena Nair",
  };

  const [user, setUser] = useState(null);

  const handleLogin = (employeeId, password) => {
    if (employees[employeeId] && password === "1234") {
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
      {user && <Header user={user} onLogout={handleLogout} logoComponent={<SaarthiLogo />} />}
      <Routes>
        <Route
          path="/"
          element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={user ? <AdminDashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/reports"
          element={user ? <ReportPage /> : <Navigate to="/" />}
        />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/issue/:id"
          element={user ? <IssueDetail /> : <Navigate to="/" />}
        />
        <Route
          path="/issues"
          element={user ? <Issues /> : <Navigate to="/" />}
        />
        <Route
          path="/pothole/:id"
          element={user ? <PotholeDetail /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
      </Routes>
    </Router>
  );
}

export default App;
