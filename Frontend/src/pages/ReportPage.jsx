import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../Styles/ReportPage.css";

const cityCoordinates = {
  Bhubaneswar: [20.296059, 85.824539],
  Cuttack: [20.462521, 85.882988],
  Puri: [19.813457, 85.831207],
  Rourkela: [22.227056, 84.861181],
};

const statusColors = {
  Pending: "gold",
  "In Progress": "royalblue",
  Resolved: "limegreen",
};

const customMarker = (status) =>
  new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 32 32" fill="${statusColors[status] || "gray"}" stroke="black" stroke-width="1.5"><circle cx="16" cy="16" r="12"/></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const problems = [
  {
    id: "1",
    title: "Pothole near MG Road",
    description: "Large pothole causing safety hazard to vehicles.",
    dept: "Public Works",
    status: "Pending",
    location: "Bhubaneswar",
  },
  {
    id: "2",
    title: "Streetlight not working",
    description: "Streetlight on Elm Street is broken for over a week.",
    dept: "Electrical",
    status: "In Progress",
    location: "Cuttack",
  },
  {
    id: "3",
    title: "Overflowing trash bin in park",
    description: "Trash bins have not been emptied in two weeks.",
    dept: "Sanitation",
    status: "Resolved",
    location: "Puri",
  },
  {
    id: "4",
    title: "Broken bench in city square",
    description: "Bench slats are broken and pose splinter risk.",
    dept: "Public Works",
    status: "Pending",
    location: "Rourkela",
  },
];

function StatusColumn({ title, problemsList }) {
  const navigate = useNavigate();

  return (
    <div className="report-column">
      <h3 className="column-title">{title}</h3>
      <div className="column-items">
        {problemsList.length === 0 && <p className="empty-text">No problems</p>}
        {problemsList.map((p) => (
          <div
            key={p.id}
            className="problem-card clickable"
            onClick={() => navigate(`/pothole/${p.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/pothole/${p.id}`)}
          >
            <strong>{p.id}</strong> - {p.title}
            <p>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const ReportPage = () => {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProblems = useMemo(() => {
    return problems.filter(
      (p) =>
        (departmentFilter === "All" || p.dept === departmentFilter) &&
        (statusFilter === "All" || p.status === statusFilter)
    );
  }, [departmentFilter, statusFilter]);

  const pendingProblems = filteredProblems.filter((p) => p.status === "Pending");
  const inProgressProblems = filteredProblems.filter((p) => p.status === "In Progress");
  const resolvedProblems = filteredProblems.filter((p) => p.status === "Resolved");

  const mapCenter =
    filteredProblems.length === 0
      ? [20.9517, 85.0985]
      : cityCoordinates[filteredProblems[0].location] || [20.9517, 85.0985];

  return (
    <div className="page-container">
      <main className="content">
        <h2>Problem Reports</h2>
        <div className="filters">
          <label>
            Department:
            <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Public Works">Public Works</option>
              <option value="Electrical">Electrical</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </label>
          <label>
            Status:
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={7.2} scrollWheelZoom={false} style={{ height: "300px", width: "100%" }}>
            <TileLayer
              attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredProblems.map((p) => (
              <Marker key={p.id} position={cityCoordinates[p.location]} icon={customMarker(p.status)}>
                <Popup>
                  <b>{p.title}</b>
                  <br />
                  <b>Status:</b> {p.status}
                  <br />
                  <b>Location:</b> {p.location}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="columns-container">
          <StatusColumn title="Pending" problemsList={pendingProblems} />
          <StatusColumn title="In Progress" problemsList={inProgressProblems} />
          <StatusColumn title="Resolved" problemsList={resolvedProblems} />
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
