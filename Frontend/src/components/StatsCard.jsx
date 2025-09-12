import React from "react";
import "../Styles/StatsCard.css";

const StatsCard = ({ title, value, type }) => {
  return (
    <div className={`card card-${type}`}>
      <h2>{title}</h2>
      <p>{value}</p>
    </div>
  );
};

export default StatsCard;
