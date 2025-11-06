// src/Context/AdminAuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { authService } from "@api/services";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "admin") {
      setCurrentUser(user);
    }
    setLoading(false);
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
