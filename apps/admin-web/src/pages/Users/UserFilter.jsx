import React from "react";

const UserFilter = ({ filter, onFilterChange, getFilteredCount }) => {
    return (
        <div className="users-filter">
            <button
                className={filter === "all" ? "active" : ""}
                onClick={() => onFilterChange("all")}
            >
                All ({getFilteredCount("all")})
            </button>
            <button
                className={filter === "active" ? "active" : ""}
                onClick={() => onFilterChange("active")}
            >
                Active ({getFilteredCount("active")})
            </button>
            <button
                className={filter === "blocked" ? "active" : ""}
                onClick={() => onFilterChange("blocked")}
            >
                Blocked ({getFilteredCount("blocked")})
            </button>
        </div>
    );
};

export default UserFilter;
