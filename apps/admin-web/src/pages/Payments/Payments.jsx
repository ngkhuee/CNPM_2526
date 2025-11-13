import React, { useState, useEffect } from "react";
import { usePaymentManagement } from "../../hooks/usePaymentManagement";
import "./Payments.css";
import { MdAttachMoney, MdSearch } from "react-icons/md";
import PaymentTable from "../../components/Payments/PaymentTable";
import PaymentFilter from "../../components/Payments/PaymentFilter";

const Payments = () => {
    const {
        withdrawals,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        fetchWithdrawals,
        getFilteredWithdrawals,
        getPendingWithdrawals,
        getCompletedWithdrawals,
        approveWithdrawal,
        rejectWithdrawal,
    } = usePaymentManagement();

    const [activeTab, setActiveTab] = useState("pending");

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const pendingWithdrawals = getPendingWithdrawals();
    const completedWithdrawals = getCompletedWithdrawals();
    const filteredWithdrawals = getFilteredWithdrawals();

    // Apply search and status filters
    let displayData = activeTab === "pending" ? pendingWithdrawals : completedWithdrawals;

    // Apply search term filter
    if (searchTerm.trim()) {
        displayData = displayData.filter((w) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                w.id.toLowerCase().includes(searchLower) ||
                w.restaurant_id?.toLowerCase().includes(searchLower) ||
                w.restaurant_name?.toLowerCase().includes(searchLower) ||
                w.bank_account?.toLowerCase().includes(searchLower)
            );
        });
    }

    // Apply status filter for completed tab
    if (activeTab === "completed" && statusFilter !== "all") {
        displayData = displayData.filter((w) => w.status === statusFilter);
    }

    const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const totalCompleted = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    return (
        <div className="main-content">
            <div className="payments-page">
                <h2>
                    <MdAttachMoney /> Payment Management
                </h2>
                <p className="subtitle">Manage withdrawal requests from restaurants</p>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card pending">
                        <div className="card-label">Pending</div>
                        <div className="card-count">{pendingWithdrawals.length}</div>
                        <div className="card-amount">
                            {(totalPending / 1000000).toFixed(1)}M VND
                        </div>
                    </div>

                    <div className="summary-card approved">
                        <div className="card-label">Approved</div>
                        <div className="card-count">
                            {completedWithdrawals.filter((w) => w.status === "approved").length}
                        </div>
                        <div className="card-amount">
                            {(
                                completedWithdrawals
                                    .filter((w) => w.status === "approved")
                                    .reduce((sum, w) => sum + w.amount, 0) / 1000000
                            ).toFixed(1)}
                            M VND
                        </div>
                    </div>

                    <div className="summary-card rejected">
                        <div className="card-label">Rejected</div>
                        <div className="card-count">
                            {completedWithdrawals.filter((w) => w.status === "rejected").length}
                        </div>
                        <div className="card-amount">
                            {(
                                completedWithdrawals
                                    .filter((w) => w.status === "rejected")
                                    .reduce((sum, w) => sum + w.amount, 0) / 1000000
                            ).toFixed(1)}
                            M VND
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === "pending" ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab("pending");
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                        >
                            Pending Requests ({pendingWithdrawals.length})
                        </button>
                        <button
                            className={`tab ${activeTab === "completed" ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab("completed");
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                        >
                            Completed ({completedWithdrawals.length})
                        </button>
                    </div>

                    {/* Filter */}
                    <PaymentFilter
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        activeTab={activeTab}
                    />
                </div>

                {/* Table */}
                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading">Loading payments...</div>
                ) : displayData.length === 0 ? (
                    <div className="empty-state">
                        <p>No withdrawals to display</p>
                    </div>
                ) : (
                    <PaymentTable
                        data={displayData}
                        onApprove={approveWithdrawal}
                        onReject={rejectWithdrawal}
                        isLoading={loading}
                        activeTab={activeTab}
                    />
                )}
            </div>
        </div>
    );
};

export default Payments;
