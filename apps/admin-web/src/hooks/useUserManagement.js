import { useState, useEffect, useCallback } from "react";
import { authService } from "shared-services";

/**
 * Hook for managing customer users (fetch, toggle status, delete)
 * Used in Admin Users page
 */
export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.getAllUsers();

            // Map db.json fields and filter only customer accounts
            const mappedUsers = (response || [])
                .map((user) => {
                    const role = Array.isArray(user.roles) ? user.roles[0] : user.role;
                    return {
                        ...user,
                        name: user.full_name || user.name,
                        role: role,
                        createdAt: user.created_at || user.createdAt,
                    };
                })
                .filter((user) => user.role === "customer");

            setUsers(mappedUsers);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Toggle user status (active/blocked)
    const handleStatusToggle = useCallback(async (userId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "blocked" : "active";
        try {
            await authService.updateUserStatus(userId, newStatus);
            await fetchUsers();
            return { success: true, newStatus };
        } catch (error) {
            console.error("Error updating user status:", error);
            return { success: false, message: error.message };
        }
    }, [fetchUsers]);

    // Delete user
    const handleDelete = useCallback(async (userId) => {
        try {
            await authService.deleteUser(userId);
            await fetchUsers();
            return { success: true };
        } catch (error) {
            console.error("Error deleting user:", error);
            return { success: false, message: error.message };
        }
    }, [fetchUsers]);

    // Get role badge class
    const getRoleBadgeClass = useCallback((role) => {
        switch (role) {
            case "admin":
                return "badge-admin";
            case "restaurant":
                return "badge-restaurant";
            case "customer":
                return "badge-customer";
            default:
                return "badge-default";
        }
    }, []);

    // Get filtered users
    const getFilteredUsers = useCallback(() => {
        if (filter === "all") return users;
        if (filter === "active") return users.filter((u) => u.status === "active" || !u.status);
        if (filter === "blocked") return users.filter((u) => u.status === "blocked");
        return users;
    }, [users, filter]);

    // Get count of users by filter
    const getFilteredCount = useCallback((filterType) => {
        switch (filterType) {
            case "all":
                return users.length;
            case "active":
                return users.filter((u) => u.status === "active" || !u.status).length;
            case "blocked":
                return users.filter((u) => u.status === "blocked").length;
            default:
                return 0;
        }
    }, [users]);

    return {
        users,
        loading,
        error,
        filter,
        setFilter,
        fetchUsers,
        handleStatusToggle,
        handleDelete,
        getRoleBadgeClass,
        getFilteredUsers,
        getFilteredCount,
    };
};
