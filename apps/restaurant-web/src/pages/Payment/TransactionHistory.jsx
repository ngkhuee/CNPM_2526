import React from "react";
import { MdCheckCircle, MdHourglassEmpty, MdCancel } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

const TransactionHistory = ({ transactions, loading, error }) => {
    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return (
                    <span className="status-badge status-approved">
                        <MdCheckCircle /> Đã duyệt
                    </span>
                );
            case "rejected":
                return (
                    <span className="status-badge status-rejected">
                        <MdCancel /> Từ chối
                    </span>
                );
            case "pending":
            default:
                return (
                    <span className="status-badge status-pending">
                        <MdHourglassEmpty /> Đang chờ
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
                <p className="loading">Đang tải lịch sử giao dịch...</p>
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
                    <p>Chưa có giao dịch nào</p>
                    <p className="empty-description">
                        Yêu cầu rút tiền của bạn sẽ xuất hiện tại đây
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
                            <th>Mã giao dịch</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày yêu cầu</th>
                            <th>Ngày duyệt</th>
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
                    <label>Tổng giao dịch:</label>
                    <span>{transactions.length}</span>
                </div>
                <div className="summary-item">
                    <label>Tổng số tiền:</label>
                    <span>
                        {formatCurrency(
                            transactions.reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </span>
                </div>
                <div className="summary-item">
                    <label>Đã duyệt:</label>
                    <span>
                        {formatCurrency(
                            transactions
                                .filter((t) => t.status === "approved")
                                .reduce((sum, t) => sum + t.amount, 0)
                        )}
                    </span>
                </div>
                <div className="summary-item">
                    <label>Đang chờ:</label>
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
