import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/PotholeDetail.css";

const potholeDetails = {
  1: {
    title: "Damaged Road",
    location: "Main Street, Downtown District, Sector 15",
    phone: "+1 (555) 123-4567",
    description: "There is a pothole on the road of this area. Resolve this.",
    details:
      "There is a large pothole on the main road of this residential area that needs immediate attention. The pothole has been causing significant inconvenience to commuters and poses a serious safety risk to vehicles, especially during night hours.",
    status: "reported",
    img: "https://sripath.com/wp-content/uploads/2025/01/iStock-174662203-1200x800.jpg",
  },
  2: {
    title: "Street Light Issue",
    location: "Park Avenue, Green Valley, Block C",
    phone: "+1 (555) 234-5678",
    description: "Broken street light causing safety concerns.",
    details:
      "The street light pole near the community park has been non-functional for the past week, creating safety concerns for evening joggers and pedestrians.",
    status: "in-progress",
    img: "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=600&q=80",
  },
  // More pothole details can be added here...
};

export default function PotholeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pothole = potholeDetails[id] || {
    title: `Pothole`,
    location: "Bhubaneswar, Odisha",
    phone: "1234567890",
    description: "There is a big pothole in this area. Please resolve it.",
    status: "Reported",
    img: "https://images.unsplash.com/photo-1515548214299-cf1a74df104b?auto=format&fit=crop&w=600&q=80",
  };

  return (
    <div className="pothole-detail-container">
      {/* Header section */}
      <header className="detail-header" aria-label="Pothole detail header">
        <h1 className="detail-title">{pothole.title}</h1>
        <p className="detail-location" aria-label="Location">
          📍 {pothole.location}
        </p>
        <p className="detail-phone" aria-label="Contact phone">
          📞 {pothole.phone}
        </p>
      </header>

      {/* Image below header */}
      <img
        src={pothole.img}
        alt={pothole.title}
        className="detail-img"
      />

      {/* Description and details below image */}
      <main className="detail-main-content">
        <p className="detail-description">{pothole.description}</p>
        <section className="detail-details">{pothole.details}</section>

        <div className="detail-actions">
          <button className="btn btn-inprogress" aria-label="Mark as In Progress">
            In Progress
          </button>
          <button className="btn btn-resolve" aria-label="Mark as Resolved">
            Resolve
          </button>
        </div>
      </main>

      {/* Back button */}
      <div className="back-button-container">
        <button
          className="back-button"
          onClick={() => navigate("/reports")}
          aria-label="Back to reports dashboard"
        >
          &larr; Back to Reports
        </button>
      </div>
    </div>
  );
}
