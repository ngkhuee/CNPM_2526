/**
 * Tracking Header - displays order and restaurant info
 */

import React from "react";
import { MdRefresh } from "react-icons/md";

export const TrackingHeader = ({
    order,
    onRefresh,
    refreshing = false,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
            }}
        >
            {/* Order Info */}
            <div>
                <h2 style={{ margin: 0, marginBottom: "8px" }}>
                    Order #{order?.id || order?._id}
                </h2>
                {(order?.restaurantName || order?.restaurant?.name) && (
                    <p
                        style={{
                            color: "#ff6b35",
                            fontWeight: "600",
                            margin: 0,
                            fontSize: "14px",
                        }}
                    >
                        {order.restaurantName || order.restaurant?.name}
                    </p>
                )}
            </div>


            {/* Inline animation */}
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default TrackingHeader;
