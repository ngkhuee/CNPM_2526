/**
 * Order Timeline Component - shows order status progression
 */

import React from "react";
import { droneProgressService } from "shared-services";
import {
    MdPayment,
    MdCheckCircle,
    MdRestaurant,
    MdInventory,
    MdFlight,
    MdLocationOn,
    MdLocalShipping,
    MdDone,
} from "react-icons/md";

export const OrderTimeline = ({ order, timelineStages = null }) => {
    const iconMap = {
        paid: <MdPayment />,
        confirmed: <MdCheckCircle />,
        preparing: <MdRestaurant />,
        ready: <MdInventory />,
        picking_up: <MdFlight style={{ transform: "rotate(45deg)" }} />,
        picked_up: <MdLocationOn />,
        delivering: <MdLocalShipping />,
        delivered: <MdDone />,
    };

    const defaultStages = [
        { status: "paid", label: "Paid" },
        { status: "confirmed", label: "Confirmed" },
        { status: "preparing", label: "Preparing" },
        { status: "ready", label: "Ready" },
        { status: "picking_up", label: "Picking Up" },
        { status: "picked_up", label: "Picked Up" },
        { status: "delivering", label: "Delivering" },
        { status: "delivered", label: "Delivered" },
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
                                        color: isCompleted ? "white" : "#999",
                                    }}
                                >
                                    {iconMap[stage.status] || stage.icon}
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
