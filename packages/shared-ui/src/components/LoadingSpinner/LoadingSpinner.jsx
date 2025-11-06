import React from "react";
import "./LoadingSpinner.css";

export const LoadingSpinner = ({
  size = "md",
  color = "primary",
  className = "",
  fullScreen = false,
}) => {
  const spinnerClass = `spinner spinner-${size} spinner-${color} ${className}`;

  if (fullScreen) {
    return (
      <div className="spinner-overlay">
        <div className={spinnerClass}></div>
      </div>
    );
  }

  return <div className={spinnerClass}></div>;
};
