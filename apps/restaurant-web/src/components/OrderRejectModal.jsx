import React, { useState } from "react";

const OrderRejectModal = ({ isOpen, order, onClose, onSubmit, loading }) => {
    const [rejectReason, setRejectReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const handleSubmit = async () => {
        const finalReason = rejectReason === "other" ? customReason : rejectReason;

        if (!finalReason || !finalReason.trim()) {
            alert("Please provide a reason for rejection");
            return;
        }

        const result = await onSubmit(finalReason);
        if (result.success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setRejectReason("");
        setCustomReason("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    maxWidth: "500px",
                    width: "90%",
                }}
            >
                <h3 style={{ marginBottom: "20px", color: "#333" }}>
                    Reject Order #{order?.id}
                </h3>

                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                        }}
                    >
                        Reason for rejection:
                    </label>
                    <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                        }}
                    >
                        <option value="">-- Select a reason --</option>
                        <option value="out_of_ingredients">Hết nguyên liệu</option>
                        <option value="too_busy">Quá tải đơn hàng</option>
                        <option value="closed">Ngoài giờ hoạt động</option>
                        <option value="other">Lý do khác</option>
                    </select>
                </div>

                {rejectReason === "other" && (
                    <div style={{ marginBottom: "20px" }}>
                        <textarea
                            value={customReason}
                            placeholder="Please specify the reason..."
                            onChange={(e) => setCustomReason(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                fontSize: "14px",
                                minHeight: "80px",
                                resize: "vertical",
                            }}
                        />
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            background: "#e0e0e0",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        {loading ? "Processing..." : "Reject Order"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderRejectModal;
