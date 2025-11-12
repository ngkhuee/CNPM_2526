import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { AuthContext } from "customer-shared";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";

const LoginPopup = ({ setShowLogin }) => {
  const { login, register } = useContext(AuthContext);
  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Chỉ check agree khi Sign Up
    if (currState === "Sign Up" && !agree) {
      alert("Please agree to the terms");
      return;
    }

    setLoading(true);

    try {
      if (currState === "Sign Up") {
        const response = await register({
          name: data.name,
          email: data.email,
          password: data.password,
          role: "user",
        });

        if (response.success) {
          alert("Account created! Please login.");
          setCurrState("Login");
        } else {
          alert(response.message || "Registration failed");
        }
      } else {
        // Login using AuthContext hook
        const response = await login(data.email, data.password);

        if (response.success) {
          // AuthContext handles token and user state
          const currentUser = JSON.parse(localStorage.getItem("user"));

          // ✅ Validate customer status from backend
          try {
            const API_BASE_URL =
              import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
            const userResponse = await fetch(
              `${API_BASE_URL}/users/${currentUser.id}`
            );

            if (userResponse.ok) {
              const userData = await userResponse.json();

              // Check if customer account is blocked
              if (userData.status === "blocked") {
                alert(
                  "Your account has been blocked by admin.\n\nPlease contact support for more information."
                );
                // Logout and clear data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setLoading(false);
                return;
              }

              if (userData.status !== "active") {
                alert("Your account is not active. Please contact support.");
                // Logout and clear data
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setLoading(false);
                return;
              }
            }
          } catch (validationError) {
            console.error("Status validation error:", validationError);
            alert("Unable to validate account status. Please try again later.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setLoading(false);
            return;
          }

          // Close popup first
          setShowLogin(false);

          // Route based on role
          if (currentUser.role === "admin") {
            // Use environment variable for admin URL
            const adminUrl =
              import.meta.env.VITE_ADMIN_URL || "http://localhost:3001/admin";
            window.location.href = adminUrl;
          } else if (currentUser.role === "restaurant") {
            navigate("/restaurant/dashboard");
          } else {
            // đổi tên biến full_name -> name = "User1"
            alert(`Đăng nhập thành công! Xin chào ${currentUser.name || currentUser.email}`);
          }
        } else {
          alert(response.message || "Email hoặc mật khẩu không đúng!");
        }
      }
    } catch (error) {
      alert(error.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup">
      <form onSubmit={onSubmit} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <span
            onClick={() => setShowLogin(false)}
            style={{
              cursor: "pointer",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <MdClose />
          </span>
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={data.name}
              onChange={onChangeHandler}
              required
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Your Email"
            value={data.email}
            onChange={onChangeHandler}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        {/* Chỉ hiện checkbox khi Sign Up */}
        {currState === "Sign Up" && (
          <div className="login-popup-condition">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : currState === "Sign Up"
              ? "Create Account"
              : "Login"}
        </button>

        <p>
          {currState === "Sign Up"
            ? "Already have an account? "
            : "Create a new account? "}
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() =>
              setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")
            }
          >
            {currState === "Sign Up" ? "Login here" : "Click here"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPopup;
