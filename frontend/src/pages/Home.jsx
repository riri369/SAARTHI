import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Home.css";

const issues = [
  {
    id: 1,
    title: "Damaged Road",
    description: "There is a pothole on the road of this area. resolve this.",
    details:
      "There is a large pothole on the main road of this residential area that needs immediate attention. The pothole has been causing significant inconvenience to commuters and poses a serious safety risk to vehicles, especially during night hours. Multiple residents have reported near-miss incidents and minor vehicle damage.",
    location: "Main Street, Downtown District, Sector 15",
    phone: "+1 (555) 123-4567",
    status: "pending",
    urgent: true,
    img: "https://images.unsplash.com/photo-1515548214299-cf1a74df104b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    title: "Broken Street Light",
    description: "",
    details:
      "The street light pole near the community park has been non-functional for the past week, creating safety concerns for evening joggers and pedestrians. This particular area is frequently used by families with children and elderly residents who depend on adequate lighting for their safety. The broken light has already resulted in a minor accident where a cyclist fell due to poor visibility. Local residents are requesting immediate repair or replacement to restore proper illumination to this high-traffic pedestrian area. The issue appears to be electrical, possibly related to recent storm damage.",
    location: "Park Avenue, Green Valley, Block C",
    phone: "+1 (555) 234-5678",
    status: "in-progress",
    urgent: true,
    reporter: "Maria Garcia",
    reportedAgo: "1 day ago",
    img: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=600&q=80",
  },
];

const stats = [
  { label: "Total Issues", value: 4, note: "+3 today" },
  { label: "Pending Issues", value: 1, note: "1 urgent", urgent: true },
  { label: "In Progress", value: 2, note: "2 active" },
  { label: "Resolved", value: 1, note: "1 completed" },
];

const filterOptions = [
  { label: "All Issues", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in-progress" },
  { label: "Resolved", value: "resolved" },
];

function Home() {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  
  const filteredIssues =
    filter === "all"
      ? issues
      : issues.filter((i) => i.status === filter);

  const handleCardClick = (issueId) => {
    navigate(`/issue/${issueId}`);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="nav-header">
        <div className="nav-brand">
          <span className="logo-icon">&#128202;</span>
          <div>
            <h1>Adirm</h1>
            <div className="subtitle">Admin Dashboard</div>
          </div>
        </div>
        <nav>
          <a href="#">Issue</a>
          <a href="#">About</a>
          <a href="#" onClick={() => navigate("/")}>Home</a>
          <a href="#">Issue</a>
          <span className="nav-user">A</span>
        </nav>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        {stats.map((stat, i) => (
          <div className={`stat-card${stat.urgent ? " urgent" : ""}`} key={stat.label}>
            <div className="stat-title">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-note${stat.urgent ? " urgent" : ""}`}>{stat.note}</div>
          </div>
        ))}
      </div>

      {/* Issue Management and Filter */}
      <main>
        <div className="issue-header-row">
          <h2>Issue Management</h2>
          <div className="filter-container">
            <select
              className="filter-dropdown"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="issue-summary">Track and resolve community issues and incidents</p>
        <div className="issues-grid">
          {filteredIssues.map((issue) => (
            <div 
              className="issue-card clickable" 
              key={issue.id}
              onClick={() => handleCardClick(issue.id)}
            >
              <img src={issue.img} alt={issue.title} className="issue-img" />
              <div className="issue-status">
                {issue.status === "pending" && <span className="status-badge pending">pending</span>}
                {issue.status === "in-progress" && <span className="status-badge inprogress">In Progress</span>}
                {issue.status === "resolved" && <span className="status-badge resolved">Resolved</span>}
              </div>
              <div className="issue-header">
                <h3 className="issue-title">{issue.title}</h3>
                {issue.urgent && <span className="urgent-flag">&#9888;</span>}
              </div>
              {issue.description && <div className="issue-desc">{issue.description}</div>}
              <div className="issue-meta">
                <div className="issue-location">&#128205; {issue.location}</div>
                <div className="issue-phone">&#128222; {issue.phone}</div>
              </div>
              <div className="issue-details">{issue.details}</div>
              {issue.reporter && (
                <div className="issue-reported">
                  <span>Reported by: <b>{issue.reporter}</b></span> &middot; <span>{issue.reportedAgo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;
