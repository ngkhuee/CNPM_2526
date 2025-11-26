/**
 * Order Timeline Component - shows order status progression
 */

import React from "react";
import { droneProgressService } from "shared-services";
import { DroneIcon } from "shared-ui";
import {
    MdPayment,
    MdCheckCircle,
    MdRestaurant,
    MdInventory,
    MdLocationOn,
    MdDone,
} from "react-icons/md";

export const OrderTimeline = ({ order, timelineStages = null }) => {
    const iconMap = {
        pending: <MdPayment />,
        paid: <MdCheckCircle />,
        confirmed: <MdCheckCircle />,
        preparing: <MdRestaurant />,
        ready: <MdInventory />,
        picking_up: <DroneIcon size={20} color="currentColor" />,
        picked_up: <MdLocationOn />,
        delivering: <DroneIcon size={20} color="currentColor" />,
        arrived: <MdLocationOn />,
        delivered: <MdDone />,
    };

    // Check if order is cancelled or rejected
    const isCancelled = order?.status === 'cancelled' || order?.status === 'rejected';

    // Timeline for cancelled/rejected orders
    const cancelledStages = [
        { status: "paid", label: "Đã thanh toán" },
        { status: order?.status, label: order?.status === 'cancelled' ? 'Đã hủy' : 'Bị từ chối' },
    ];

    // Normal timeline: Paid → Confirmed → Preparing → Delivering → Completed
    const defaultStages = [
        { status: "paid", label: "Đã thanh toán" },
        { status: "confirmed", label: "Đã xác nhận" },
        { status: "preparing", label: "Đang chuẩn bị" },
        { status: "delivering", label: "Đang giao" },
        { status: "delivered", label: "Hoàn thành" },
    ];

    const stages = timelineStages || (isCancelled ? cancelledStages : defaultStages);
    const statusOrder = stages.map((s) => s.status);

    // Get current status from order
    let currentStatus = order?.status;

    const currentIndex = statusOrder.indexOf(currentStatus);

    // Drone journey status message
    const getDroneStatusMessage = () => {
        if (!order?.drone_journey_stage) return null;

        const messages = {
            searching: "Đang tìm drone khả dụng...",
            going_to_restaurant: "Drone đang trên đường đến nhà hàng...",
            at_restaurant: "Drone đã đến nhà hàng, đang chờ lấy đồ ăn...",
            going_to_customer: "Drone đang giao đơn hàng của bạn!",
            at_customer: "Drone đã đến vị trí của bạn!",
        };

        return messages[order.drone_journey_stage];
    };

    const droneMessage = getDroneStatusMessage();

    return (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
            {droneMessage && (
                <div
                    style={{
                        background: "#e3f2fd",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#1976d2",
                        border: "1px solid #90caf9",
                    }}
                >
                    {droneMessage}
                </div>
            )}
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
                                        background: isCancelled && isCompleted ? "#f44336" : (isCompleted ? "#4caf50" : "#e0e0e0"),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px",
                                        marginBottom: "8px",
                                        boxShadow: isActive ? (isCancelled ? "0 0 10px rgba(244, 67, 54, 0.5)" : "0 0 10px rgba(76, 175, 80, 0.5)") : "none",
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
                                        background: isCancelled && isCompleted ? "#f44336" : (isCompleted ? "#4caf50" : "#e0e0e0"),
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
