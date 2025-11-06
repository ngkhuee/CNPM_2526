// useAuth hook - Auth logic shared across all apps
import { useState, useEffect, useCallback } from "react";
import { authService } from "shared-services";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = authService.getCurrentUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      }
      setInitialized(true);
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      if (response.success) {
        // Auto login after register
        setUser(response.user);
        setToken(response.token);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken("");
  }, []);

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    login,
    register,
    logout,
    setUser,
    setToken,
  };
};
