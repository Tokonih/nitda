// Update KPI visualization logic to reflect activities instead of KPIs

import React from "react";
import { Bar } from "react-chartjs-2";

const ActivityVisualization = ({ activities }) => {
  // Process activities data to extract relevant information for visualization
  const activityData = {
    labels: activities.map((activity) => activity.name),
    datasets: [
      {
        label: "Activity Level",
        data: activities.map((activity) => activity.level),
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  // Options for the chart
  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h2>Activity Visualization</h2>
      <Bar data={activityData} options={options} />
    </div>
  );
};

export default ActivityVisualization;
