import React, { useState } from "react";
import { formatCurrency } from "@utils/formatters";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import "./PaymentTable.css";

const PaymentTable = ({ data = [], onApprove, onReject, isLoading, activeTab }) => {
    const [submitting, setSubmitting] = useState({});

    const handleApprove = async (withdrawalId) => {
        setSubmitting((prev) => ({ ...prev, [withdrawalId]: true }));
        try {
            const result = await onApprove(withdrawalId);
            if (result.success) {
                alert("Đã duyệt yêu cầu rút tiền!");
            } else {
                alert(`Lỗi: ${result.message}`);
            }
        } finally {
            setSubmitting((prev) => ({ ...prev, [withdrawalId]: false }));
        }
    };

    const handleReject = async (withdrawalId) => {
        if (window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) {
            setSubmitting((prev) => ({ ...prev, [withdrawalId]: true }));
            try {
                const result = await onReject(withdrawalId);
                if (result.success) {
                    alert("Đã từ chối yêu cầu rút tiền!");
                } else {
                    alert(`Lỗi: ${result.message}`);
                }
            } finally {
                setSubmitting((prev) => ({ ...prev, [withdrawalId]: false }));
            }
        }
    };

    if (data.length === 0) {
        return <div className="empty-message">Không có dữ liệu</div>;
    }

    return (
        <div className="payment-table-wrapper">
            <table className="payment-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nhà hàng</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày yêu cầu</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((withdrawal) => (
                        <tr key={withdrawal.id} className="table-row">
                            <td className="id-cell">
                                <code>{withdrawal.id}</code>
                            </td>
                            <td className="name-cell">{withdrawal.restaurant_name}</td>
                            <td className="amount-cell">{formatCurrency(withdrawal.amount)}</td>
                            <td className="status-cell">
                                <span className={`status-badge status-${withdrawal.status}`}>
                                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                            </td>
                            <td className="date-cell">
                                {new Date(withdrawal.created_at).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="actions-cell">
                                {activeTab === "pending" && withdrawal.status === "pending" ? (
                                    <div className="action-buttons">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleApprove(withdrawal.id)}
                                            disabled={submitting[withdrawal.id]}
                                            title="Duyệt"
                                        >
                                            <MdCheckCircle size={18} />
                                            {submitting[withdrawal.id] ? "..." : "Duyệt"}
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => handleReject(withdrawal.id)}
                                            disabled={submitting[withdrawal.id]}
                                            title="Từ chối"
                                        >
                                            <MdCancel size={18} />
                                            {submitting[withdrawal.id] ? "..." : "Từ chối"}
                                        </button>
                                    </div>
                                ) : (
                                    <span className="no-action">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentTable;
