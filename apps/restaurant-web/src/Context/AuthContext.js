// src/Context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { authService } from "@api/services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const user = authService.getCurrentUser();

      if (user && user.role === "restaurant" && user.restaurantId) {
        // Validate restaurantId format (r1, r2, r_123456789, etc.)
        if (/^r[_\d]+$/.test(user.restaurantId)) {
          setCurrentUser(user);

          // Validate user and restaurant status (non-blocking)
          if (token) {
            try {
              const API_BASE_URL =
                import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

              const [userResponse, restaurantResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/users/${user.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/restaurants/${user.restaurantId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                }),
              ]);

              if (userResponse.ok && restaurantResponse.ok) {
                const [userData, restaurantData] = await Promise.all([
                  userResponse.json(),
                  restaurantResponse.json(),
                ]);

                // Check if user or restaurant is blocked
                if (
                  userData.status === "blocked" ||
                  userData.status !== "active" ||
                  restaurantData.status === "blocked" ||
                  restaurantData.status !== "active"
                ) {
                  console.warn(
                    "Restaurant or user account is blocked/inactive, logging out..."
                  );
                  authService.logout();
                  setCurrentUser(null);
                }
              }
            } catch (error) {
              console.error(
                "Error validating restaurant status on init:",
                error
              );
              // Don't logout on network error during initialization
            }
          }
        } else {
          console.warn("Invalid restaurantId format, clearing...");
          authService.logout();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData) => {
    if (userData.role === "restaurant" && userData.restaurantId) {
      setCurrentUser(userData);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const contextValue = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};
