import React from "react";

const UserFilter = ({ filter, onFilterChange, getFilteredCount }) => {
    return (
        <div className="users-filter">
            <button
                className={filter === "all" ? "active" : ""}
                onClick={() => onFilterChange("all")}
            >
                Tất cả ({getFilteredCount("all")})
            </button>
            <button
                className={filter === "active" ? "active" : ""}
                onClick={() => onFilterChange("active")}
            >
                Hoạt động ({getFilteredCount("active")})
            </button>
            <button
                className={filter === "blocked" ? "active" : ""}
                onClick={() => onFilterChange("blocked")}
            >
                Đã khóa ({getFilteredCount("blocked")})
            </button>
        </div>
    );
};

export default UserFilter;
