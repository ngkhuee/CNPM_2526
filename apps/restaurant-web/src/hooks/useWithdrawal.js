import { useState, useContext, useCallback } from "react";
import { RestaurantContext } from "../Context/RestaurantContext";

export const useWithdrawal = () => {
    const { currentRestaurant } = useContext(RestaurantContext);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [totalWithdrawn, setTotalWithdrawn] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

    // Fetch available balance
    const fetchBalance = useCallback(async () => {
        if (!currentRestaurant?.id) return;

        setLoading(true);
        try {
            // Get all orders for this restaurant
            const ordersResponse = await fetch(
                `${API_BASE_URL}/orders?restaurant_id=${currentRestaurant.id}`
            );
            const ordersData = await ordersResponse.json();

            // Calculate total earned from completed orders
            const earned = ordersData
                .filter((order) => order.status === "delivered")
                .reduce((sum, order) => sum + order.total_amount, 0);

            // Get all withdrawals for this restaurant
            const withdrawalsResponse = await fetch(
                `${API_BASE_URL}/withdrawals?restaurant_id=${currentRestaurant.id}`
            );
            const withdrawalsData = withdrawalsResponse.ok
                ? await withdrawalsResponse.json()
                : [];

            // Calculate total withdrawn (approved only)
            const withdrawn = withdrawalsData
                .filter((w) => w.status === "approved")
                .reduce((sum, w) => sum + w.amount, 0);

            // Available = Earned - Withdrawn
            const available = earned - withdrawn;

            setTotalEarned(earned);
            setTotalWithdrawn(withdrawn);
            setAvailableBalance(Math.max(0, available));
            setError(null);
        } catch (err) {
            console.error("Error fetching balance:", err);
            setError("Failed to load balance");
        } finally {
            setLoading(false);
        }
    }, [currentRestaurant?.id, API_BASE_URL]);

    // Fetch transaction history
    const fetchTransactions = useCallback(async () => {
        if (!currentRestaurant?.id) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/withdrawals?restaurant_id=${currentRestaurant.id}`
            );
            const data = response.ok ? await response.json() : [];

            // Sort by created_at descending
            const sorted = data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            setTransactions(sorted);
            setError(null);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    }, [currentRestaurant?.id, API_BASE_URL]);

    // Submit withdrawal request
    const submitWithdrawal = useCallback(
        async (amount) => {
            if (!currentRestaurant?.id) {
                return {
                    success: false,
                    message: "Restaurant ID not found",
                };
            }

            if (amount <= 0 || amount > availableBalance) {
                return {
                    success: false,
                    message: "Invalid withdrawal amount",
                };
            }

            setLoading(true);
            try {
                const withdrawalData = {
                    id: `w_${Date.now()}`,
                    restaurant_id: currentRestaurant.id,
                    amount: amount,
                    status: "pending",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    approved_at: null,
                };

                const response = await fetch(`${API_BASE_URL}/withdrawals`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(withdrawalData),
                });

                if (response.ok) {
                    const newTransaction = await response.json();
                    setTransactions((prev) => [newTransaction, ...prev]);
                    return {
                        success: true,
                        message: "Withdrawal request submitted successfully",
                        data: newTransaction,
                    };
                } else {
                    return {
                        success: false,
                        message: "Failed to submit withdrawal request",
                    };
                }
            } catch (err) {
                console.error("Error submitting withdrawal:", err);
                return {
                    success: false,
                    message: err.message || "An error occurred",
                };
            } finally {
                setLoading(false);
            }
        },
        [currentRestaurant?.id, availableBalance, API_BASE_URL]
    );

    return {
        availableBalance,
        totalEarned,
        totalWithdrawn,
        transactions,
        loading,
        error,
        fetchBalance,
        fetchTransactions,
        submitWithdrawal,
    };
};
