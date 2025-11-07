// src/Context/AdminAuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { authService } from "@api/services";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const user = authService.getCurrentUser();

      if (user && user.role === "admin") {
        setCurrentUser(user);

        // Validate admin status (non-blocking)
        if (token) {
          try {
            const API_BASE_URL =
              import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

            const userResponse = await fetch(
              `${API_BASE_URL}/users/${user.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();

              // Check if admin account is blocked
              if (
                userData.status === "blocked" ||
                userData.status !== "active"
              ) {
                console.warn(
                  "Admin account is blocked/inactive, logging out..."
                );
                authService.logout();
                setCurrentUser(null);
              }
            }
          } catch (error) {
            console.error("Error validating admin status on init:", error);
            // Don't logout on network error during initialization
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);

      if (response.success && response.user) {
        if (response.user.role === "admin") {
          setCurrentUser(response.user);
          return { success: true, user: response.user };
        } else {
          return { success: false, message: "Not an admin account" };
        }
      }

      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, message: error.message };
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
    AdminAuthContext.Provider,
    { value: contextValue },
    children
  );
};
