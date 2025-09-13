import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Issues.css";

const potholeData = {
  reported: [
    { id: 1, name: "Pothole - Road A", date: "2025-09-10", location: "Downtown" },
    { id: 2, name: "Pothole - Road B", date: "2025-09-09", location: "Uptown" },
    { id: 3, name: "Pothole - Road C", date: "2025-09-08", location: "Midtown" },
    { id: 4, name: "Pothole - Road D", date: "2025-09-07", location: "Downtown" },
    { id: 5, name: "Pothole - Road E", date: "2025-09-06", location: "Westside" },
    { id: 6, name: "Pothole - Road F", date: "2025-09-05", location: "Eastside" },
    { id: 7, name: "Pothole - Road G", date: "2025-09-04", location: "Southside" },
  ],
  inProgress: [
    { id: 8, name: "Pothole - Road H", date: "2025-09-03", location: "Downtown" },
    { id: 9, name: "Pothole - Road I", date: "2025-09-02", location: "Uptown" },
    { id: 10, name: "Pothole - Road J", date: "2025-09-01", location: "Midtown" },
    { id: 11, name: "Pothole - Road K", date: "2025-08-31", location: "Downtown" },
    { id: 12, name: "Pothole - Road L", date: "2025-08-30", location: "Westside" },
    { id: 13, name: "Pothole - Road M", date: "2025-08-29", location: "Eastside" },
    { id: 14, name: "Pothole - Road N", date: "2025-08-28", location: "Northside" },
    { id: 15, name: "Pothole - Road O", date: "2025-08-27", location: "Southside" },
    { id: 16, name: "Pothole - Road P", date: "2025-08-26", location: "Downtown" },
    { id: 17, name: "Pothole - Road Q", date: "2025-08-25", location: "Uptown" },
  ],
  resolved: [
    { id: 18, name: "Pothole - Road R", date: "2025-08-24", location: "Midtown" },
    { id: 19, name: "Pothole - Road S", date: "2025-08-23", location: "Downtown" },
    { id: 20, name: "Pothole - Road T", date: "2025-08-22", location: "Westside" },
    { id: 21, name: "Pothole - Road U", date: "2025-08-21", location: "Eastside" },
    { id: 22, name: "Pothole - Road V", date: "2025-08-20", location: "Northside" },
    { id: 23, name: "Pothole - Road W", date: "2025-08-19", location: "Southside" },
    { id: 24, name: "Pothole - Road X", date: "2025-08-18", location: "Downtown" },
    { id: 25, name: "Pothole - Road Y", date: "2025-08-17", location: "Uptown" },
  ],
};

function Column({ title, data, sort, onSortChange, onItemClick }) {
  const sortData = (data) => {
    let sortedData = [...data];
    if (sort === "name") {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "date") {
      sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "location") {
      sortedData.sort((a, b) => a.location.localeCompare(b.location));
    }
    return sortedData;
  };

  const sorted = sortData(data);

  return (
    <div className="issue-column">
      <div className="column-header">
        <h3>{title}</h3>
        <div className="column-actions">
          <select className="sort-select" value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="location">Sort by Location</option>
          </select>
        </div>
      </div>
      <div className="column-content">
        {sorted.map((pothole) => (
          <div
            key={pothole.id}
            className="pothole-item clickable"
            onClick={() => onItemClick(pothole.id)}
          >
            <div className="pothole-name">{pothole.name}</div>
            <div className="pothole-meta">
              {pothole.location} • {pothole.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Issues() {
  const navigate = useNavigate();
  const [sorts, setSorts] = useState({
    reported: "date",
    inProgress: "date",
    resolved: "date",
  });

  const handlePotholeClick = (potholeId) => {
    navigate(`/pothole/${potholeId}`);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="issues-container">
      <main className="issues-main">
        <div className="issues-grid">
          <Column
            title="Reported"
            data={potholeData.reported}
            sort={sorts.reported}
            onSortChange={(val) => setSorts({ ...sorts, reported: val })}
            onItemClick={handlePotholeClick}
          />
          <Column
            title="In-Progress"
            data={potholeData.inProgress}
            sort={sorts.inProgress}
            onSortChange={(val) => setSorts({ ...sorts, inProgress: val })}
            onItemClick={handlePotholeClick}
          />
          <Column
            title="Resolved"
            data={potholeData.resolved}
            sort={sorts.resolved}
            onSortChange={(val) => setSorts({ ...sorts, resolved: val })}
            onItemClick={handlePotholeClick}
          />
        </div>
      </main>

      <div className="back-button-wrapper bottom-right">
        <button className="back-button" onClick={handleBackToDashboard}>
          &larr; Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Issues;
