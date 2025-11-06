import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { AdminAuthContext } from "../../Context/AdminAuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login: loginAdmin, logout: logoutAdmin } =
    useContext(AdminAuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use AdminAuthContext login method (which calls authService internally)
      const response = await loginAdmin(email, password);

      if (response.success && response.user) {
        // Check role must be admin
        if (response.user.role !== "admin") {
          setError("This account is not an admin account!");
          logoutAdmin();
          return;
        }

        // Navigate to admin dashboard
        navigate("/admin");
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
    <div className="admin-login-page">
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <p className="subtitle">System Management Portal</p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@yummy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
