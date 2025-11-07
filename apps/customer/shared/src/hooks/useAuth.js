// useAuth hook - Auth logic tách riêng để web và mobile dùng chung
import { useState, useEffect, useCallback } from "react";
import { authService } from "shared-services";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state from localStorage and validate status
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = authService.getCurrentUser();

      if (savedToken && savedUser) {
        // Set user first to avoid blank screen
        setToken(savedToken);
        setUser(savedUser);

        // Validate customer status from backend (non-blocking)
        try {
          // Use environment variable or fallback to localhost
          const API_BASE_URL =
            process.env.VITE_API_BASE_URL || "http://localhost:4000";
          const userResponse = await fetch(
            `${API_BASE_URL}/users/${savedUser.id}`,
            {
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },
            }
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();

            // Check if customer account is blocked or not active
            if (userData.status === "blocked" || userData.status !== "active") {
              console.warn(
                "Customer account is blocked or not active, logging out..."
              );
              authService.logout();
              setToken("");
              setUser(null);
              setInitialized(true);
              return;
            }
          } else {
            // Don't logout on network error during initialization
            console.warn("Cannot validate user status on init, continuing...");
          }
        } catch (error) {
          // Don't logout on network error during initialization
          console.error("Error validating customer status on init:", error);
        }
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
