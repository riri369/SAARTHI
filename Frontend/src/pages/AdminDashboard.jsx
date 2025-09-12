import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "../Styles/AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = ({ user }) => {
  const stats = { submitted: 120, resolved: 85, inProgress: 25 };
  const topPerformers = [
    { name: "Aarav Sharma", points: 150 },
    { name: "Priya Mehta", points: 120 },
    { name: "Rahul Verma", points: 95 },
  ];

  const barData = {
    labels: ["Submitted", "Resolved", "In Progress"],
    datasets: [
      {
        label: "Problems",
        data: [stats.submitted, stats.resolved, stats.inProgress],
        backgroundColor: ["#1e40af", "#16a34a", "#d97706"],
        borderRadius: 5,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Department Insights", font: { size: 18 } },
      tooltip: { enabled: true },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 20 } } },
  };

  const pieData = {
    labels: ["Submitted", "Resolved", "In Progress"],
    datasets: [
      {
        data: [stats.submitted, stats.resolved, stats.inProgress],
        backgroundColor: ["#1e40af", "#16a34a", "#d97706"],
        hoverOffset: 30,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
      title: { display: true, text: "Problem Status Distribution" },
    },
  };

  // logout function should be passed down from parent if needed
  // here's a placeholder just for ensure no errors if used
  const handleLogout = () => {
    localStorage.removeItem("saarthiUser");
    // navigation back to login should be handled outside or via react-router
  };

  return (
    <div className="admin-dashboard">
      <div className="page-container">
        {/* Header should be rendered in App.jsx, so omitted here */}
        <main className="content">
          <h2>Department Insights</h2>

          <div className="dashboard-container">
            {/* Complaints stats and pie chart side by side */}
            <section className="stats-overview">
              <div className="stats-cards">
                <div className="card submitted">
                  <h2>Total Submitted</h2>
                  <p>{stats.submitted}</p>
                </div>
                <div className="card resolved">
                  <h2>Resolved</h2>
                  <p>{stats.resolved}</p>
                </div>
                <div className="card in-progress">
                  <h2>In Progress</h2>
                  <p>{stats.inProgress}</p>
                </div>
              </div>

              <div className="pie-container">
                <h2 className="chart-title">Problems Breakdown</h2>
                <Pie data={pieData} options={pieOptions} />
              </div>
            </section>

            {/* Top Performers and bar chart side by side */}
            <section className="performers-charts">
              <div className="top-performers">
                <h2>Top Performers</h2>
                <div className="performers-cards">
                  {topPerformers.map((user, idx) => (
                    <div key={idx} className="performer-card">
                      <div className="performer-name">{user.name}</div>
                      <div className="performer-points">{user.points} pts</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bar-container">
                <h2 className="chart-title">Problems Overview</h2>
                <Bar data={barData} options={barOptions} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
