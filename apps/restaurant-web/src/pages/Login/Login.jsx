import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import login_bg from "../../assets/login_bg.png";
import { authService } from "@api/services";

const Login = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear any corrupted localStorage data on mount (run only once)
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (
      user &&
      (!user.role || !user.restaurantId || user.role !== "restaurant")
    ) {
      console.warn("Detected corrupted user data in localStorage, clearing...");
      authService.logout();
      if (setCurrentUser) {
        setCurrentUser(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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
          return;
        }

        // Kiểm tra có restaurantId không
        if (!response.user.restaurantId) {
          setError("Restaurant ID not found!");
          authService.logout();
          return;
        }

        // Lưu user info vào App state
        setCurrentUser(response.user);

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

        {/* <div className="demo-credentials">
          <p>Demo accounts:</p>
          <small>restaurant1@yummy.com / 123</small>
        </div> */}
      </form>
    </div>
  );
};

export default Login;
