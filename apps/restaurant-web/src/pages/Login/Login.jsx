import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import login_bg from "../../assets/login_bg.png";
import { authService } from "@api/services";
import { AuthContext } from "../../Context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.success && response.user) {
        // Kiểm tra role phải là restaurant
        if (response.user.role !== "restaurant") {
          setError("This account is not a restaurant account!");
          authService.logout();
          setLoading(false);
          return;
        }

        // Kiểm tra có restaurantId không
        if (!response.user.restaurantId) {
          setError("Restaurant ID not found!");
          authService.logout();
          setLoading(false);
          return;
        }

        // ✅ Validate user status from backend
        try {
          const API_BASE_URL =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
          const userResponse = await fetch(
            `${API_BASE_URL}/users/${response.user.id}`
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();

            // Check user account status
            if (userData.status === "blocked") {
              setError(
                "Your account has been blocked by admin.\n\nPlease contact support for more information."
              );
              authService.logout();
              setLoading(false);
              return;
            }

            if (userData.status === "pending") {
              setError(
                "Your restaurant registration is pending approval.\n\nPlease wait for admin to review and approve your account.\nYou will be notified once approved."
              );
              authService.logout();
              setLoading(false);
              return;
            }

            if (userData.status !== "active") {
              setError("Your account is not active. Please contact support.");
              authService.logout();
              setLoading(false);
              return;
            }
          }

          // Check restaurant status
          const restaurantResponse = await fetch(
            `${API_BASE_URL}/restaurants/${response.user.restaurantId}`
          );

          if (restaurantResponse.ok) {
            const restaurantData = await restaurantResponse.json();

            if (restaurantData.status === "blocked") {
              setError(
                "Your restaurant has been blocked by admin.\n\nPlease contact support for more information."
              );
              authService.logout();
              setLoading(false);
              return;
            }

            if (restaurantData.status === "pending") {
              setError(
                "Your restaurant registration is pending approval.\n\nPlease wait for admin to review and approve your restaurant.\nYou will be notified once approved."
              );
              authService.logout();
              setLoading(false);
              return;
            }

            if (restaurantData.status !== "active") {
              setError(
                "Your restaurant is not active. Please contact support."
              );
              authService.logout();
              setLoading(false);
              return;
            }
          }
        } catch (validationError) {
          console.error("Status validation error:", validationError);
          setError(
            "Unable to validate account status. Please try again later."
          );
          authService.logout();
          setLoading(false);
          return;
        }

        // All checks passed - Lưu user info vào AuthContext
        login(response.user);

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        setError(response.message || "Login failed!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="login-page">
    //   <form className="login-form" onSubmit={handleSubmit}>
    //     <h2>Restaurant Login</h2>
    //     {error && <p className="error">{error}</p>}
    //     <input
    //       type="text"
    //       placeholder="Username"
    //       value={username}
    //       onChange={(e) => setUsername(e.target.value)}
    //       required
    //     />
    //     <input
    //       type="password"
    //       placeholder="Password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       required
    //     />
    //     <button type="submit">Đăng nhập</button>
    //   </form>
    // </div>
    <div className="login-page" style={{ backgroundImage: `url(${login_bg})` }}>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Restaurant Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
