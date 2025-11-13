/**
 * Delivery Status Card - shows current delivery status
 */

import React from "react";
import { droneProgressService } from "shared-services";
import {
    MdCheckCircle,
    MdDeliveryDining,
    MdRestaurantMenu,
} from "react-icons/md";

export const DeliveryStatusCard = ({
    order,
    droneProgress,
    droneArrived,
    onConfirmDelivery,
    confirming = false,
}) => {
    const statusText = droneProgressService.getDroneProgressText(droneProgress);
    const statusColor = droneProgressService.getStatusColor(
        droneProgress,
        order?.status
    );

    const getStatusIcon = () => {
        if (order?.status === "delivered") {
            return <MdCheckCircle size={50} color="#fff" />;
        } else if (
            ["ready", "picking_up", "picked_up", "delivering"].includes(
                order?.status
            )
        ) {
            return <MdDeliveryDining size={50} color="#fff" />;
        } else {
            return <MdRestaurantMenu size={50} color="#fff" />;
        }
    };

    return (
        <div
            style={{
                background: statusColor,
                borderRadius: "8px",
                padding: "20px",
                color: "white",
                textAlign: "center",
                marginTop: "20px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
        >
            <div style={{ marginBottom: "10px" }}>{getStatusIcon()}</div>

            <div
                style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                }}
            >
                {statusText}
            </div>

            {/* Delivery Progress Percentage */}
            {order?.status === "delivering" && (
                <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                    {Math.round(droneProgress * 100)}% complete
                </div>
            )}

            {/* Drone Location */}
            {order?.current_gps && order?.status === "delivering" && (
                <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.9 }}>
                    Position: {order.current_gps.lat?.toFixed(6)},{" "}
                    {order.current_gps.lng?.toFixed(6)}
                </p>
            )}

            {/* Confirm Delivery Button */}
            {droneArrived && order?.status === "delivering" && (
                <>
                    <button
                        onClick={onConfirmDelivery}
                        disabled={confirming}
                        style={{
                            marginTop: "15px",
                            padding: "12px 24px",
                            background: confirming ? "#9e9e9e" : "#2e7d32",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: confirming ? "not-allowed" : "pointer",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!confirming) {
                                e.target.style.background = "#1b5e20";
                                e.target.style.transform = "translateY(-2px)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!confirming) {
                                e.target.style.background = "#2e7d32";
                                e.target.style.transform = "translateY(0)";
                            }
                        }}
                    >
                        {confirming ? "Confirming..." : "Confirm Received"}
                    </button>

                    <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.9 }}>
                        Automatic confirmation in 5 minutes if you don't click the button
                    </p>
                </>
            )}
        </div>
    );
};

export default DeliveryStatusCard;
