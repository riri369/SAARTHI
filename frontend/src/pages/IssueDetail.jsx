import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/Home.css";

const issuesData = [
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
    mapImg: "https://via.placeholder.com/400x200?text=Map+Location"
  },
  {
    id: 2,
    title: "Broken Street Light",
    description: "",
    details:
      "The street light pole near the community park has been non-functional for the past week, creating safety concerns for evening joggers and pedestrians. This particular area is frequently used by families with children and elderly residents who depend on adequate lighting for their safety.",
    location: "Park Avenue, Green Valley, Block C",
    phone: "+1 (555) 234-5678",
    status: "in-progress",
    urgent: true,
    reporter: "Maria Garcia",
    reportedAgo: "1 day ago",
    img: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=600&q=80",
    mapImg: "https://via.placeholder.com/400x200?text=Map+Location"
  },
];

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const issue = issuesData.find(issue => issue.id === parseInt(id));

  if (!issue) {
    return <div>Issue not found</div>;
  }

  return (
    <div className="home-container">
      {/* Same Header */}
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

      {/* Issue Detail Content */}
      <main className="issue-detail-main">
        <div className="issue-detail-card">
          <img src={issue.img} alt={issue.title} className="detail-img" />
          
          <div className="detail-content">
            <div className="detail-header">
              <h1 className="detail-title">{issue.title}</h1>
              {issue.urgent && <span className="urgent-flag">&#9888;</span>}
            </div>
            
            <p className="detail-description">{issue.description}</p>
            
            <div className="detail-meta">
              <div className="detail-location">&#128205; {issue.location}</div>
              <div className="detail-phone">&#128222; {issue.phone}</div>
            </div>
            
            <div className="detail-details">{issue.details}</div>
            
            {issue.reporter && (
              <div className="detail-reported">
                Reported by: <strong>{issue.reporter}</strong> • {issue.reportedAgo}
              </div>
            )}
            
            <div className="map-section">
              <img src={issue.mapImg} alt="Location Map" className="map-img" />
            </div>
            
            <div className="detail-actions">
              <button className="btn-inprogress">In Progress</button>
              <button className="btn-resolve">Resolve</button>
            </div>
          </div>
        </div>
        
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default IssueDetail;
