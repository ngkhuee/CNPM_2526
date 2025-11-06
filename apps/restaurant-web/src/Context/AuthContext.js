// src/Context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { authService } from "@api/services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "restaurant" && user.restaurantId) {
      // Validate restaurantId format
      if (/^r\d+$/.test(user.restaurantId)) {
        setCurrentUser(user);
      } else {
        console.warn("Invalid user data detected, clearing...");
        authService.logout();
        setCurrentUser(null);
      }
    }
    setLoading(false);
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
