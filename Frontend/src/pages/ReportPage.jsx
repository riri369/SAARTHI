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
  Sundargarh: [22.1096, 84.0271],
  Berhampur: [19.3143, 84.7914],
  Sambalpur: [21.4667, 83.9667],
};

const statusColors = {
  Reported: "gold",
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
  { id: "ELO-2025-001", title: "Streetlight", dept: "Electrical", status: "Reported", location: "Bhubaneswar" },
  { id: "ELO-2025-002", title: "Power Outage", dept: "Electrical", status: "Reported", location: "Cuttack" },
  { id: "ELO-2025-003", title: "Wire Snapped", dept: "Electrical", status: "Reported", location: "Puri" },
  { id: "ELO-2025-004", title: "Transformer", dept: "Electrical", status: "Resolved", location: "Sundargarh" },
  { id: "ELO-2025-005", title: "Meter Fault", dept: "Electrical", status: "In Progress", location: "Berhampur" },
  { id: "E-OR-001", title: "Streetlight", dept: "Electrical", status: "Resolved", location: "Cuttack" },
  { id: "E-OR-002", title: "Transformer", dept: "Electrical", status: "In Progress", location: "Bhubaneswar" },
  { id: "E-OR-003", title: "Power Outage", dept: "Electrical", status: "In Progress", location: "Berhampur" },
  { id: "E-OR-004", title: "Meter Fault", dept: "Electrical", status: "Resolved", location: "Sambalpur" },
  { id: "E-OR-005", title: "Wire Snapped", dept: "Electrical", status: "Reported", location: "Puri" },
  { id: "EIR-OD-0001", title: "Streetlight", dept: "Electrical", status: "In Progress", location: "Bhubaneswar" },
  { id: "EIR-OD-0002", title: "Power Outage", dept: "Electrical", status: "In Progress", location: "Cuttack" },
  { id: "EIR-OD-0003", title: "Transformer", dept: "Electrical", status: "Resolved", location: "Sambalpur" },
  { id: "EIR-OD-0004", title: "Meter Fault", dept: "Electrical", status: "Resolved", location: "Rourkela" },
  { id: "EIR-OD-0005", title: "Wire Snapped", dept: "Electrical", status: "Reported", location: "Berhampur" },
];

function StatusColumn({ title, problemsList }) {
  const navigate = useNavigate();

  return (
    <div className="report-column">
      <h3 className="column-title">{title}</h3>
      <div className="column-items">
        {problemsList.length === 0 && <p className="empty-text">No issues reported</p>}
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

  const reportedProblems = filteredProblems.filter((p) => p.status === "Reported");
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
              <option value="Electrical">Electrical</option>
            </select>
          </label>
          <label>
            Status:
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Reported">Reported</option>
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
          <StatusColumn title="Reported" problemsList={reportedProblems} />
          <StatusColumn title="In Progress" problemsList={inProgressProblems} />
          <StatusColumn title="Resolved" problemsList={resolvedProblems} />
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
