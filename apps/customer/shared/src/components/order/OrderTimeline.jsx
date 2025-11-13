/**
 * Order Timeline Component - shows order status progression
 */

import React from "react";
import { droneProgressService } from "shared-services";

export const OrderTimeline = ({ order, timelineStages = null }) => {
    const defaultStages = [
        { status: "paid", label: "Paid", icon: "💳" },
        { status: "confirmed", label: "Confirmed", icon: "✓" },
        { status: "preparing", label: "Preparing", icon: "👨‍🍳" },
        { status: "ready", label: "Ready", icon: "📦" },
        { status: "picking_up", label: "Picking Up", icon: "🚁" },
        { status: "picked_up", label: "Picked Up", icon: "📍" },
        { status: "delivering", label: "Delivering", icon: "🚚" },
        { status: "delivered", label: "Delivered", icon: "✅" },
    ];

    const stages = timelineStages || defaultStages;
    const statusOrder = stages.map((s) => s.status);
    const currentIndex = statusOrder.indexOf(order?.status);

    return (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {stages.map((stage, index) => {
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <React.Fragment key={stage.status}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    flex: 1,
                                }}
                            >
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: isCompleted ? "#4caf50" : "#e0e0e0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px",
                                        marginBottom: "8px",
                                        boxShadow: isActive ? "0 0 10px rgba(76, 175, 80, 0.5)" : "none",
                                    }}
                                >
                                    {stage.icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        color: isCompleted ? "#333" : "#999",
                                        textAlign: "center",
                                    }}
                                >
                                    {stage.label}
                                </div>
                            </div>

                            {index < stages.length - 1 && (
                                <div
                                    style={{
                                        height: "2px",
                                        flex: 1,
                                        background: isCompleted ? "#4caf50" : "#e0e0e0",
                                        margin: "0 4px 24px 4px",
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
