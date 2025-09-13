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

  const performersBarData = {
    labels: topPerformers.map((user) => user.name),
    datasets: [
      {
        label: "Points",
        data: topPerformers.map((user) => user.points),
        backgroundColor: "#16a34a",
        borderRadius: 5,
      },
    ],
  };

  const performersBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top Performers", font: { size: 18 } },
      tooltip: { enabled: true },
    },
    scales: { 
      y: { beginAtZero: true, ticks: { stepSize: 20 } },
      x: { ticks: { font: { size: 14 } } },
    },
    indexAxis: 'y',
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
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
      title: { display: false },
    },
  };

  return (
    <div className="admin-dashboard">
      <div className="page-container">
        <main className="content">
          <h2>Department Insights</h2>

          {/* Unified Card: Stats + Pie Chart */}
          <div className="overview-card">
            <div className="card-header">Problems Overview</div>
            <div className="card-body">
              <div className="stats-column">
                <div className="overview-stat-card submitted">
                  <div className="stat-label">Total Submitted</div>
                  <div className="stat-value">{stats.submitted}</div>
                </div>
                <div className="overview-stat-card resolved">
                  <div className="stat-label">Resolved</div>
                  <div className="stat-value">{stats.resolved}</div>
                </div>
                <div className="overview-stat-card in-progress">
                  <div className="stat-label">In Progress</div>
                  <div className="stat-value">{stats.inProgress}</div>
                </div>
              </div>
              <div className="pie-column">
                <div className="pie-wrapper">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers Row */}
          <div className="performers-table-bar-row">
            <div className="top-performers-table-card">
              <div className="table-header">Top Performers</div>
              <div className="table-performers-list">
                {topPerformers.map((user, idx) => (
                  <div key={idx} className="table-performer-row">
                    <span className="table-performer-name">{user.name}</span>
                    <span className="table-performer-points">{user.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="performers-bar-outer">
              <Bar data={performersBarData} options={performersBarOptions} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
 