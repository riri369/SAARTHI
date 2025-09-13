import React from "react";
import { Bar } from "react-chartjs-2";
import "../Styles/TopPerformers.css";
const TopPerformers = ({ performers }) => {
  const performerData = {
    labels: performers.map((p) => p.name),
    datasets: [
      {
        label: "Points",
        data: performers.map((p) => p.points),
        backgroundColor: "#0077b6",
      },
    ],
  };

  return (
    <div className="chart-box">
      <h3>Top Performers</h3>
      <Bar data={performerData} />
    </div>
  );
};

export default TopPerformers;
