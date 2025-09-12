// src/pages/ReportPage.jsx
import React, { useState, useMemo } from "react";
import "../Styles/ReportsPage.css";

const ReportPage = () => {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const [reports, setReports] = useState([
    { id: "R001", user: "Ananya Gupta", desc: "Pothole near MG Road", dept: "Public Works", status: "Pending" },
    { id: "R002", user: "Vikram Singh", desc: "Streetlight not working", dept: "Electrical", status: "In Progress" },
    { id: "R003", user: "Meena Nair", desc: "Overflowing trash bin", dept: "Sanitation", status: "Resolved" },
    { id: "R004", user: "Rohit Kumar", desc: "Broken bench", dept: "Public Works", status: "Pending" },
  ]);

  // Update status cycle: Pending -> In Progress -> Resolved
  const updateStatus = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Pending" ? "In Progress" : "Resolved" }
          : r
      )
    );
  };

  // Sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filtering + Sorting logic
  const displayedReports = useMemo(() => {
    let filteredReports = [...reports];

    if (departmentFilter !== "All") {
      filteredReports = filteredReports.filter((r) => r.dept === departmentFilter);
    }

    if (statusFilter !== "All") {
      filteredReports = filteredReports.filter((r) => r.status === statusFilter);
    }

    if (sortConfig.key !== null) {
      filteredReports.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filteredReports;
  }, [reports, departmentFilter, statusFilter, sortConfig]);

  return (
    <div className="page-container">
      <main className="content">
        <h2>All Reports</h2>

        {/* Filters */}
        <div className="filters">
          <label>
            Department:
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Public Works">Public Works</option>
              <option value="Electrical">Electrical</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </label>

          <label>
            Status:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort("id")}>ID</th>
                <th onClick={() => requestSort("user")}>User</th>
                <th onClick={() => requestSort("desc")}>Description</th>
                <th onClick={() => requestSort("dept")}>Department</th>
                <th onClick={() => requestSort("status")}>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedReports.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.user}</td>
                  <td>{r.desc}</td>
                  <td>{r.dept}</td>
                  <td className={r.status.replace(" ", "-").toLowerCase()}>{r.status}</td>
                  <td>
                    <button onClick={() => updateStatus(r.id)}>Update Status</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
