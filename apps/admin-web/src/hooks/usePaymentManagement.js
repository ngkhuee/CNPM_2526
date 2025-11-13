import { useState, useCallback } from "react";

/**
 * Hook for admin payment management
 * Handles: getWithdrawals, approveWithdrawal, rejectWithdrawal, search/filter
 */
export const usePaymentManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, approved, rejected

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  /**
   * Fetch all withdrawals with restaurants data
   */
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const withdrawalsResponse = await fetch(`${API_BASE_URL}/withdrawals`);
      const withdrawalsData = (await withdrawalsResponse.ok)
        ? await withdrawalsResponse.json()
        : [];

      const restaurantsResponse = await fetch(`${API_BASE_URL}/restaurants`);
      const restaurantsData = (await restaurantsResponse.ok)
        ? await restaurantsResponse.json()
        : [];

      // Join withdrawals with restaurant info
      const enriched = withdrawalsData.map((w) => {
        const restaurant = restaurantsData.find(
          (r) => r.id === w.restaurant_id
        );
        return {
          ...w,
          restaurant_name: restaurant?.name || "Unknown",
        };
      });

      // Sort by created_at descending (newest first)
      const sorted = enriched.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setWithdrawals(sorted);
      setError(null);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setError("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  /**
   * Get filtered withdrawals based on search and status
   */
  const getFilteredWithdrawals = useCallback(() => {
    let filtered = withdrawals;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.id.toLowerCase().includes(term) ||
          w.restaurant_name.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [withdrawals, searchTerm, statusFilter]);

  /**
   * Get only pending withdrawals
   */
  const getPendingWithdrawals = useCallback(() => {
    return withdrawals.filter((w) => w.status === "pending");
  }, [withdrawals]);

  /**
   * Get only completed withdrawals (approved + rejected)
   */
  const getCompletedWithdrawals = useCallback(() => {
    return withdrawals.filter(
      (w) => w.status === "approved" || w.status === "rejected"
    );
  }, [withdrawals]);

  /**
   * Approve withdrawal
   */
  const approveWithdrawal = useCallback(
    async (withdrawalId) => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          return {
            success: false,
            message: "Authentication required. Please login again.",
          };
        }

        const response = await fetch(
          `${API_BASE_URL}/withdrawals/${withdrawalId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "approved",
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (response.ok) {
          const updated = await response.json();

          // Update local state
          setWithdrawals((prev) =>
            prev.map((w) => (w.id === withdrawalId ? { ...w, ...updated } : w))
          );

          // Also need to update restaurant balance
          const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
          if (withdrawal) {
            // Get current balance
            const balanceResponse = await fetch(
              `${API_BASE_URL}/restaurant_balances?restaurant_id=${withdrawal.restaurant_id}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );
            const balances = (await balanceResponse.ok)
              ? await balanceResponse.json()
              : [];
            const currentBalance = balances[0];

            if (currentBalance) {
              // Update balance (deduct withdrawn amount from available)
              const newAvailable = Math.max(
                0,
                currentBalance.available_balance - withdrawal.amount
              );
              const newTotalWithdrawn =
                currentBalance.total_withdrawn + withdrawal.amount;

              await fetch(
                `${API_BASE_URL}/restaurant_balances/${currentBalance.id}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    available_balance: newAvailable,
                    total_withdrawn: newTotalWithdrawn,
                    last_updated: new Date().toISOString(),
                  }),
                }
              );
            }
          }

          return { success: true, message: "Withdrawal approved successfully" };
        } else {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errorData.message || "Failed to approve withdrawal",
          };
        }
      } catch (err) {
        console.error("Error approving withdrawal:", err);
        return { success: false, message: err.message };
      }
    },
    [withdrawals, API_BASE_URL]
  );

  /**
   * Reject withdrawal
   */
  const rejectWithdrawal = useCallback(
    async (withdrawalId) => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          return {
            success: false,
            message: "Authentication required. Please login again.",
          };
        }

        const response = await fetch(
          `${API_BASE_URL}/withdrawals/${withdrawalId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: "rejected",
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (response.ok) {
          const updated = await response.json();

          // Update local state
          setWithdrawals((prev) =>
            prev.map((w) => (w.id === withdrawalId ? { ...w, ...updated } : w))
          );

          return { success: true, message: "Withdrawal rejected" };
        } else {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errorData.message || "Failed to reject withdrawal",
          };
        }
      } catch (err) {
        console.error("Error rejecting withdrawal:", err);
        return { success: false, message: err.message };
      }
    },
    [API_BASE_URL]
  );

  return {
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
  };
};
