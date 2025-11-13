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
                alert("Withdrawal approved successfully!");
            } else {
                alert(`Error: ${result.message}`);
            }
        } finally {
            setSubmitting((prev) => ({ ...prev, [withdrawalId]: false }));
        }
    };

    const handleReject = async (withdrawalId) => {
        if (window.confirm("Are you sure you want to reject this withdrawal?")) {
            setSubmitting((prev) => ({ ...prev, [withdrawalId]: true }));
            try {
                const result = await onReject(withdrawalId);
                if (result.success) {
                    alert("Withdrawal rejected!");
                } else {
                    alert(`Error: ${result.message}`);
                }
            } finally {
                setSubmitting((prev) => ({ ...prev, [withdrawalId]: false }));
            }
        }
    };

    if (data.length === 0) {
        return <div className="empty-message">No data to display</div>;
    }

    return (
        <div className="payment-table-wrapper">
            <table className="payment-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Restaurant</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Request Date</th>
                        <th>Actions</th>
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
                                            title="Approve"
                                        >
                                            <MdCheckCircle size={18} />
                                            {submitting[withdrawal.id] ? "..." : "Approve"}
                                        </button>
                                        <button
                                            className="btn-reject"
                                            onClick={() => handleReject(withdrawal.id)}
                                            disabled={submitting[withdrawal.id]}
                                            title="Reject"
                                        >
                                            <MdCancel size={18} />
                                            {submitting[withdrawal.id] ? "..." : "Reject"}
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
