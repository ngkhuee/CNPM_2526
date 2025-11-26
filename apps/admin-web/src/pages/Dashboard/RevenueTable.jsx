import React from "react";
import { getImageUrl, formatRating } from "shared-utils";

const RevenueTable = ({ restaurants, formatCurrency }) => {
    if (!restaurants || restaurants.length === 0) {
        return <p>Chưa có dữ liệu doanh thu</p>;
    }

    const getRankColor = (index) => {
        if (index === 0) return "#ffd700"; // Gold
        if (index === 1) return "#c0c0c0"; // Silver
        if (index === 2) return "#cd7f32"; // Bronze
        return "#666"; // Default
    };

    const getRowBackground = (index) => {
        return index < 3 ? "#fff8e1" : "white";
    };

    return (
        <table
            className="revenue-table"
            style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            <thead>
                <tr
                    style={{
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                    }}
                >
                    <th
                        style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                        }}
                    >
                        Hạng
                    </th>
                    <th
                        style={{
                            padding: "12px",
                            textAlign: "left",
                            fontWeight: "600",
                        }}
                    >
                        Nhà hàng
                    </th>
                    <th
                        style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "600",
                        }}
                    >
                        Đơn hàng
                    </th>
                    <th
                        style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "600",
                        }}
                    >
                        Doanh thu
                    </th>
                    <th
                        style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "600",
                        }}
                    >
                        TB/Đơn hàng
                    </th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((restaurant, index) => (
                    <tr
                        key={restaurant.id}
                        style={{
                            borderBottom: "1px solid #e9ecef",
                            backgroundColor: getRowBackground(index),
                        }}
                    >
                        <td style={{ padding: "12px" }}>
                            <span
                                style={{
                                    fontWeight: "bold",
                                    color: getRankColor(index),
                                    fontSize: "18px",
                                }}
                            >
                                #{index + 1}
                            </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                {restaurant.image && (
                                    <img
                                        src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${restaurant.image}`}
                                        alt={restaurant.name}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "8px",
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                                <span style={{ fontWeight: "500" }}>
                                    {restaurant.name}
                                </span>
                            </div>
                        </td>
                        <td
                            style={{
                                padding: "12px",
                                textAlign: "right",
                                color: "#666",
                            }}
                        >
                            {restaurant.orderCount}
                        </td>
                        <td
                            style={{
                                padding: "12px",
                                textAlign: "right",
                                fontWeight: "600",
                                color: "#10b981",
                            }}
                        >
                            {formatCurrency(restaurant.revenue)}
                        </td>
                        <td
                            style={{
                                padding: "12px",
                                textAlign: "right",
                                color: "#666",
                            }}
                        >
                            {restaurant.orderCount > 0
                                ? formatCurrency(
                                    restaurant.revenue / restaurant.orderCount
                                )
                                : formatCurrency(0)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RevenueTable;
