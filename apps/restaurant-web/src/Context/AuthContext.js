// src/Context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { authService } from "shared-services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = authService.getCurrentUser();
      if (user?.role === "restaurant" && user?.restaurantId && /^r[_\d]+$/.test(user.restaurantId)) {
        try {
          const token = localStorage.getItem("token");
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

          const [userResponse, restaurantResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/users/${user.id}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }),
            fetch(`${API_BASE_URL}/restaurants/${user.restaurantId}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
          ]);

          if (userResponse.ok && restaurantResponse.ok) {
            const [userData, restaurantData] = await Promise.all([
              userResponse.json(),
              restaurantResponse.json()
            ]);

            // Check if user or restaurant is blocked or not active
            if (userData.status === "blocked" || userData.status !== "active" ||
              restaurantData.status === "blocked" || restaurantData.status !== "active") {
              console.warn("User or restaurant account is blocked/inactive on startup, logging out...");
              authService.logout();
              setCurrentUser(null);
            } else {
              setCurrentUser(user);
            }
          } else {
            // If we can't validate, still load user to avoid blank screen
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error validating user status on startup:", error);
          // Still load user on network error during init
          setCurrentUser(user);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData) => {
    if (userData?.role === "restaurant" && userData?.restaurantId) {
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
