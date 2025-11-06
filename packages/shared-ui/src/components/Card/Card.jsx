import React from "react";
import "./Card.css";

export const Card = ({
  children,
  className = "",
  padding = "md",
  shadow = true,
  hoverable = false,
  ...props
}) => {
  const cardClass = `card card-padding-${padding} ${shadow ? "card-shadow" : ""} ${hoverable ? "card-hoverable" : ""} ${className}`;

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};
