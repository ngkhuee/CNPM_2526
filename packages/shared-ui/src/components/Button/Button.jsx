import React from "react";
import "./Button.css";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${disabled ? "btn-disabled" : ""} ${loading ? "btn-loading" : ""} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className="btn-spinner"></span> : children}
    </button>
  );
};
