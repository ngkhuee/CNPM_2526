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
                setSubmitSuccess(`Withdrawal request submitted successfully! Amount: ${formatCurrency(amount)}`);
                setActiveTab("history");
                fetchBalance();
                fetchTransactions();
            } else {
                setSubmitError(result.message || "Failed to submit withdrawal request");
            }
        } catch (err) {
            setSubmitError(err.message || "An error occurred");
        }
    };

    return (
        <div className="main-content">
            <div className="payment-page">
                <h2>
                    <MdAttachMoney /> Payment & Withdrawal Management
                </h2>
                <p className="subtitle">Manage your earnings and withdraw funds</p>

                {/* Balance Cards */}
                <div className="balance-cards">
                    <div className="balance-card primary">
                        <div className="card-label">Available Balance</div>
                        <div className="card-amount">{formatCurrency(availableBalance)}</div>
                        <div className="card-description">Ready to withdraw</div>
                    </div>

                    <div className="balance-card secondary">
                        <div className="card-label">Total Earned</div>
                        <div className="card-amount">{formatCurrency(totalEarned)}</div>
                        <div className="card-description">All-time earnings</div>
                    </div>

                    <div className="balance-card secondary">
                        <div className="card-label">Total Withdrawn</div>
                        <div className="card-amount">{formatCurrency(totalWithdrawn)}</div>
                        <div className="card-description">Total withdrawals</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "form" ? "active" : ""}`}
                            onClick={() => setActiveTab("form")}
                        >
                            <MdAttachMoney /> Request Withdrawal
                        </button>
                        <button
                            className={`tab ${activeTab === "history" ? "active" : ""}`}
                            onClick={() => setActiveTab("history")}
                        >
                            <MdHistory /> Transaction History
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
