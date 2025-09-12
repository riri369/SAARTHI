import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../Styles/ReportPage.css";

const cityCoordinates = {
  Bhubaneswar: [20.296059, 85.824539],
  Cuttack: [20.462521, 85.882988],
  Puri: [19.813457, 85.831207],
  Rourkela: [22.227056, 84.861181]
};

const statusColors = {
  "Pending": "gold",
  "In Progress": "royalblue",
  "Resolved": "limegreen"
};

const customMarker = (status) =>
  new L.DivIcon({
    className: "",
    html: `<svg width="28" height="28" viewBox="0 0 32 32" fill="${statusColors[status] || 'gray'}" stroke="black" stroke-width="1.5"><circle cx="16" cy="16" r="12"/></svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });

const ReportPage = () => {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  const [reports, setReports] = useState([
    { id: "R001", user: "Ananya Gupta", desc: "Pothole near MG Road", dept: "Public Works", status: "Pending", location: "Bhubaneswar" },
    { id: "R002", user: "Vikram Singh", desc: "Streetlight not working", dept: "Electrical", status: "In Progress", location: "Cuttack" },
    { id: "R003", user: "Meena Nair", desc: "Overflowing trash bin", dept: "Sanitation", status: "Resolved", location: "Puri" },
    { id: "R004", user: "Rohit Kumar", desc: "Broken bench", dept: "Public Works", status: "Pending", location: "Rourkela" }
  ]);

  // Update status cycle: Pending -> In Progress -> Resolved
  const updateStatus = (id) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Pending" ? "In Progress" : r.status === "In Progress" ? "Resolved" : "Resolved" }
          : r
      )
    );
  };

  // Sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Filtering + Sorting logic
  const displayedReports = useMemo(() => {
    let filteredReports = [...reports];

    if (departmentFilter !== "All") {
      filteredReports = filteredReports.filter((r) => r.dept === departmentFilter);
    }

    if (statusFilter !== "All") {
      filteredReports = filteredReports.filter((r) => r.status === statusFilter);
    }

    if (sortConfig.key !== null) {
      filteredReports.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filteredReports;
  }, [reports, departmentFilter, statusFilter, sortConfig]);

  // Center the map: Odisha or first marker location
  const mapCenter =
    displayedReports.length === 0
      ? [20.9517, 85.0985]
      : cityCoordinates[displayedReports[0].location] || [20.9517, 85.0985];

  return (
    <div className="page-container">
      <main className="content">
        <h2>All Reports</h2>

        {/* Filters */}
        <div className="filters">
          <label>
            Department:
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Public Works">Public Works</option>
              <option value="Electrical">Electrical</option>
              <option value="Sanitation">Sanitation</option>
            </select>
          </label>

          <label>
            Status:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer center={mapCenter} zoom={7.2} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {displayedReports.map((r) => (
              <Marker
                key={r.id}
                position={cityCoordinates[r.location]}
                icon={customMarker(r.status)}
              >
                <Popup>
                  <b>{r.user}</b><br />
                  {r.desc}<br />
                  <b>Status:</b> {r.status}<br />
                  <b>Location:</b> {r.location}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort("id")}>ID</th>
                <th onClick={() => requestSort("user")}>User</th>
                <th onClick={() => requestSort("desc")}>Description</th>
                <th onClick={() => requestSort("dept")}>Department</th>
                <th onClick={() => requestSort("location")}>Location</th>
                <th onClick={() => requestSort("status")}>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedReports.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.user}</td>
                  <td>{r.desc}</td>
                  <td>{r.dept}</td>
                  <td>{r.location}</td>
                  <td className={r.status.replace(" ", "-").toLowerCase()}>{r.status}</td>
                  <td>
                    <button onClick={() => updateStatus(r.id)}>Update Status</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
