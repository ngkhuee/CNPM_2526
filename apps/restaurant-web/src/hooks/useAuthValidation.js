import { useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { authService } from "shared-services";

export const useAuthValidation = () => {
    const { currentUser, logout } = useContext(AuthContext);

    useEffect(() => {
        if (!currentUser) return;

        const validateAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                logout();
                return;
            }

            try {
                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

                const [userResponse, restaurantResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/restaurants/${currentUser.restaurantId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (userResponse.ok && restaurantResponse.ok) {
                    const [userData, restaurantData] = await Promise.all([
                        userResponse.json(),
                        restaurantResponse.json(),
                    ]);

                    if (
                        userData.status === "blocked" ||
                        userData.status !== "active" ||
                        restaurantData.status === "blocked" ||
                        restaurantData.status !== "active"
                    ) {
                        console.warn("Restaurant or user account is blocked/inactive, logging out...");
                        authService.logout();
                        logout();
                    }
                }
            } catch (error) {
                console.error("Error validating restaurant status:", error);
            }
        };

        // Validate on component mount and every 5 minutes
        validateAuth();
        const interval = setInterval(validateAuth, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [currentUser, logout]);

    return { isValid: !!currentUser };
};
