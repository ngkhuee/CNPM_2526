import React from "react";
import { MdCheckCircle, MdHourglassEmpty, MdCancel } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

const TransactionHistory = ({ transactions, loading, error }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return (
                    <span className="status-badge status-approved">
                        <MdCheckCircle /> Approved
                    </span>
                );
            case "rejected":
                return (
                    <span className="status-badge status-rejected">
                        <MdCancel /> Rejected
                    </span>
                );
            case "pending":
            default:
                return (
                    <span className="status-badge status-pending">
                        <MdHourglassEmpty /> Pending
                    </span>
                );
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="transaction-history-container">
                <p className="loading">Loading transaction history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transaction-history-container">
                <p className="error">Error: {error}</p>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="transaction-history-container">
                <div className="empty-state">
                    <p>No transactions yet</p>
                    <p className="empty-description">
                        Your withdrawal requests will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="transaction-history-container">
            <div className="transaction-table-wrapper">
                <table className="transaction-table">
                    <thead>
                        <tr>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Requested Date</th>
                            <th>Approved Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className={`status-${transaction.status}`}>
                                <td className="transaction-id">
                                    <code>{transaction.id}</code>
                                </td>
                                <td className="transaction-amount">
                                    <strong>{formatCurrency(transaction.amount)}</strong>
                                </td>
                                <td className="transaction-status">
                                    {getStatusBadge(transaction.status)}
                                </td>
                                <td className="transaction-date">
                                    {formatDate(transaction.created_at)}
                                </td>
                                <td className="transaction-date">
                                    {transaction.approved_at
                                        ? formatDate(transaction.approved_at)
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="transaction-summary">
                <div className="summary-item">
                    <label>Total Transactions:</label>
                    <span>{transactions.length}</span>
                </div>
                <div className="summary-item">
                    <label>Total Amount:</label>
                    <span>
                        {formatCurrency(
                            transactions.reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </span>
                </div>
                <div className="summary-item">
                    <label>Approved:</label>
                    <span>
                        {formatCurrency(
                            transactions
                                .filter((t) => t.status === "approved")
                                .reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </span>
                </div>
                <div className="summary-item">
                    <label>Pending:</label>
                    <span>
                        {formatCurrency(
                            transactions
                                .filter((t) => t.status === "pending")
                                .reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;
