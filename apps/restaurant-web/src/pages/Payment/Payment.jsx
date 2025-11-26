import React, { useState, useEffect } from "react";
import { useWithdrawal } from "../../hooks/useWithdrawal";
import WithdrawalForm from "./WithdrawalForm";
import TransactionHistory from "./TransactionHistory";
import "./Payment.css";
import { MdAttachMoney, MdHistory } from "react-icons/md";
import { formatCurrency } from "@utils/formatters";

const Payment = () => {
    const {
        availableBalance,
        totalEarned,
        totalWithdrawn,
        transactions,
        loading,
        error,
        submitWithdrawal,
        fetchBalance,
        fetchTransactions,
    } = useWithdrawal();

    const [activeTab, setActiveTab] = useState("form");
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");

    useEffect(() => {
        fetchBalance();
        fetchTransactions();
    }, []);

    const handleWithdrawalSubmit = async (amount) => {
        setSubmitError("");
        setSubmitSuccess("");

        try {
            const result = await submitWithdrawal(amount);
            if (result.success) {
                setSubmitSuccess(`Yêu cầu rút tiền thành công! Số tiền: ${formatCurrency(amount)}`);
                setActiveTab("history");
                fetchBalance();
                fetchTransactions();
            } else {
                setSubmitError(result.message || "Không thể gửi yêu cầu rút tiền");
            }
        } catch (err) {
            setSubmitError(err.message || "An error occurred");
        }
    };

    return (
        <div className="main-content">
            <div className="payment-page">
                <h2>
                    <MdAttachMoney /> Quản lý Thanh toán & Rút tiền
                </h2>
                <p className="subtitle">Quản lý thu nhập và rút tiền</p>

                {/* Balance Cards */}
                <div className="balance-cards">
                    <div className="balance-card primary">
                        <div className="card-label">Số dư khả dụng</div>
                        <div className="card-amount">{formatCurrency(availableBalance)}</div>
                        <div className="card-description">Sẵn sàng rút tiền</div>
                    </div>

                    <div className="balance-card secondary">
                        <div className="card-label">Tổng thu nhập</div>
                        <div className="card-amount">{formatCurrency(totalEarned)}</div>
                        <div className="card-description">Thu nhập từ trước đến nay</div>
                    </div>

                    <div className="balance-card secondary">
                        <div className="card-label">Tổng đã rút</div>
                        <div className="card-amount">{formatCurrency(totalWithdrawn)}</div>
                        <div className="card-description">Tổng số tiền đã rút</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "form" ? "active" : ""}`}
                            onClick={() => setActiveTab("form")}
                        >
                            <MdAttachMoney /> Yêu cầu rút tiền
                        </button>
                        <button
                            className={`tab ${activeTab === "history" ? "active" : ""}`}
                            onClick={() => setActiveTab("history")}
                        >
                            <MdHistory /> Lịch sử giao dịch
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {submitError && <div className="alert alert-error">{submitError}</div>}
                    {submitSuccess && <div className="alert alert-success">{submitSuccess}</div>}

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === "form" && (
                            <WithdrawalForm
                                availableBalance={availableBalance}
                                onSubmit={handleWithdrawalSubmit}
                                loading={loading}
                            />
                        )}

                        {activeTab === "history" && (
                            <TransactionHistory
                                transactions={transactions}
                                loading={loading}
                                error={error}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
