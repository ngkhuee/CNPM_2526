import React from "react";
import "./Badge.css";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const badgeClass = `badge badge-${variant} badge-${size} ${className}`;

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
};
