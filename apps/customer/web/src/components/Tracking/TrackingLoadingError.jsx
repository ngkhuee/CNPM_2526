import React from "react";
import { useNavigate } from "react-router-dom";

const TrackingLoadingError = ({ loading, error, orderId }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="tracking-page" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error || !orderId) {
        return (
            <div className="tracking-page" style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>❌</div>
                <p>Không tìm thấy đơn hàng (#{orderId})</p>
                <button
                    onClick={() => navigate("/myorders")}
                    style={{
                        marginTop: "15px",
                        padding: "10px 20px",
                        background: "#ff6b35",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Quay lại đơn hàng
                </button>
            </div>
        );
    }

    return null;
};

export default TrackingLoadingError;
