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
          setError("Tài khoản này không phải là tài khoản quản trị viên!");
          logoutAdmin();
          return;
        }

        // Navigate to admin dashboard
        navigate("/admin");
      } else {
        setError(response.message || "Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập Quản trị viên</h2>
          <p className="subtitle">Cổng quản lý hệ thống</p>

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
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
