import React, { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../Styles/ReportsPage.css";

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
  SOS: "red",
};

const customMarker = (status) =>
  new L.DivIcon({
    className: "",
    html: `<div style="
      background:${statusColors[status] || "gray"};
      width:22px;height:22px;border-radius:50%;border:3px solid white;
      box-shadow:0 0 8px rgba(55,0,0,0.4);
      "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const initialProblems = [
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

function StatusColumn({ title, problemsList, status, disableClick, disableColor }) {
  const navigate = useNavigate();

  const columnStyle = disableColor
    ? { backgroundColor: "#e0e0e0", pointerEvents: "none" }
    : {};

  const titleStyle = disableColor
    ? { color: "#6b7280", borderBottom: "2px solid #d1d5db" } // gray text and border
    : status === "SOS"
    ? { color: "red", borderBottom: "2px solid #d51a1a" }
    : { color: "#405da9", borderBottom: "2px solid #e2e8f0" }; // blue default

  return (
    <div className="report-column" style={columnStyle}>
      <div className="column-title" style={titleStyle}>
        {title}
      </div>
      {problemsList.length === 0 ? (
        <div className="empty-text">No issues reported</div>
      ) : (
        problemsList.map((p) => (
          <div
            key={p.id}
            className="problem-card"
            onClick={() => !disableClick && navigate(`/report/${p.id}`)}
            style={{
              cursor: disableClick ? "default" : "pointer",
              userSelect: disableClick ? "none" : "auto",
            }}
          >
            <div className="problem-id-title">{p.id}: {p.title}</div>
            <div className="problem-desc">
              <strong>Status:</strong> {p.status}<br />
              <strong>Location:</strong> {p.location}
            </div>
          </div>
        ))
      )}
    </div>
  );
}


export default function ReportsPage() {
  const [showSOS, setShowSOS] = useState(false);
  const [problems, setProblems] = useState(initialProblems);
  const timersRef = React.useRef([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProblems((prevProblems) => [
        ...prevProblems,
        {
          id: "ELO-2025-NEW",
          title: "Streetlight Broken",
          dept: "Electrical",
          status: "Reported",
          location: "Rourkela",
        },
      ]);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    if (showSOS) {
      const timer1 = setTimeout(() => {
        setProblems((prev) => {
          if (prev.some((p) => p.id === "SOS-NEW-001")) return prev;
          return [
            ...prev,
            {
              id: "SOS-NEW-001",
              title: "Dam Breach",
              dept: "Disaster",
              status: "SOS",
              location: "Cuttack",
            },
          ];
        });
      }, 5000);

      const timer2 = setTimeout(() => {
        setProblems((prev) => {
          if (prev.some((p) => p.id === "SOS-NEW-002")) return prev;
          return [
            ...prev,
            {
              id: "SOS-NEW-002",
              title: "Bridge Collapse",
              dept: "Disaster",
              status: "SOS",
              location: "Sundargarh",
            },
          ];
        });
      }, 6500);

      timersRef.current.push(timer1, timer2);
    }

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [showSOS]);

  const reportedProblems = useMemo(() => problems.filter((p) => p.status === "Reported"), [problems]);
  const inProgressProblems = useMemo(() => problems.filter((p) => p.status === "In Progress"), [problems]);
  const resolvedProblems = useMemo(() => problems.filter((p) => p.status === "Resolved"), [problems]);
  const sosProblems = useMemo(() => problems.filter((p) => p.status === "SOS"), [problems]);

  return (
    <div className="page-container">
      <div className="content">
        <h2>Problem Reports</h2>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <button
            className="see-details-link"
            style={{ backgroundColor: "#405da9" }}
            onClick={() => setShowSOS(false)}
            disabled={!showSOS}
          >
            Hide Disaster
          </button>
          <button
            className="see-details-link"
            style={{ backgroundColor: "#d51a1a" }}
            onClick={() => setShowSOS(true)}
            disabled={showSOS}
          >
            Disaster
          </button>
        </div>
        <div className="map-container">
          <MapContainer
            center={cityCoordinates.Bhubaneswar}
            zoom={7}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            />
            {problems.map(
              (p) =>
                cityCoordinates[p.location] && (
                  <Marker
                    key={p.id}
                    position={cityCoordinates[p.location]}
                    icon={customMarker(p.status)}
                  >
                    <Popup>
                      <strong>{p.title}</strong>
                      <br />
                      Status:{" "}
                      <span style={{ color: statusColors[p.status] }}>
                        {p.status}
                      </span>
                      <br />
                      Location: {p.location}
                    </Popup>
                  </Marker>
                )
            )}
          </MapContainer>
        </div>
        <div
          className="columns-container"
          style={
            showSOS
              ? { gridTemplateColumns: "repeat(4, 1fr)" }
              : { gridTemplateColumns: "repeat(3, 1fr)" }
          }
        >
          {/* Disable clicking + gray color for other columns when SOS active */}
          <StatusColumn
            title="Reported"
            problemsList={reportedProblems}
            status="Reported"
            disableClick={showSOS}
            disableColor={showSOS}
          />
          <StatusColumn
            title="In Progress"
            problemsList={inProgressProblems}
            status="In Progress"
            disableClick={showSOS}
            disableColor={showSOS}
          />
          <StatusColumn
            title="Resolved"
            problemsList={resolvedProblems}
            status="Resolved"
            disableClick={showSOS}
            disableColor={showSOS}
          />
          {showSOS && (
            <StatusColumn
              title="SOS"
              problemsList={sosProblems}
              status="SOS"
              // SOS column stays enabled with normal color
              disableClick={false}
              disableColor={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
