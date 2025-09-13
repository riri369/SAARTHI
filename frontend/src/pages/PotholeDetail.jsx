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
    mapImg: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Map+Location",
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
    mapImg: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Map+Location",
  },
  // Add more pothole details as needed...
};

export default function PotholeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const pothole = potholeDetails[id] || {
    title: `Pothole #${id}`,
    location: "Unknown Location",
    phone: "N/A",
    description: "Description not available.",
    details: "Further details are not available at the moment.",
    status: "unknown",
    img: "https://images.unsplash.com/photo-1515548214299-cf1a74df104b?auto=format&fit=crop&w=600&q=80",
    mapImg: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Map+Location",
  };

  return (
    <div className="pothole-detail-container">
     <main className="pothole-detail-main">
        <article className="detail-card" aria-labelledby="detail-title">
          <img src={pothole.img} alt={pothole.title} className="detail-img" />

          <section className="detail-content">
            <h2 id="detail-title" className="detail-title">{pothole.title}</h2>
            <p className="detail-description">{pothole.description}</p>

            <address className="detail-meta">
              <p className="detail-location" aria-label="Location">
                📍 {pothole.location}
              </p>
              <p className="detail-phone" aria-label="Contact phone">
                📞 {pothole.phone}
              </p>
            </address>

            <section className="detail-details">{pothole.details}</section>

            <div className="map-section">
              <img src={pothole.mapImg} alt={`Map location for ${pothole.title}`} className="map-img" />
            </div>

            <div className="detail-actions">
              {/* These buttons should eventually trigger relevant status updates */}
              <button className="btn btn-inprogress" aria-label="Mark as In Progress">
                In Progress
              </button>
              <button className="btn btn-resolve" aria-label="Mark as Resolved">
                Resolve
              </button>
            </div>
          </section>
        </article>

       <div className="back-button-container">
  <button
    className="back-button"
    onClick={() => navigate("/reports")}
    aria-label="Back to reports dashboard"
  >
    &larr; Back to Reports
  </button>
</div>

      </main>
    </div>
  );
}
