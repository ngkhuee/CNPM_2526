import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import { authService } from "@api/services";
import { MdClose } from "react-icons/md";

const LoginPopup = ({ setShowLogin }) => {
  const { setUser, setToken, cartItems } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login"); // Default to Login
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

    if (!agree) {
      alert("Please agree to the terms");
      return;
    }

    setLoading(true);

    try {
      if (currState === "Sign Up") {
        const response = await authService.register({
          name: data.name,
          email: data.email,
          password: data.password,
          role: "user",
        });

        if (response.success) {
          alert("Account created! Please login.");
          setCurrState("Login");
        }
      } else {
        // Login
        const response = await authService.login(data.email, data.password);

        if (response.success) {
          // IMPORTANT: Token đã được lưu trong authService.login()
          // Set token trong context TRƯỚC user để tránh race condition
          setToken(response.token);

          // Small delay để đảm bảo token đã được lưu hoàn toàn
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Bây giờ mới set user (trigger OrderContext fetch)
          setUser(response.user);

          // Route based on role
          if (response.user.role === "admin") {
            window.location.href = "http://localhost:3001/admin";
          } else if (response.user.role === "restaurant") {
            navigate("/restaurant/dashboard");
          } else {
            alert(`Đăng nhập thành công! Xin chào ${response.user.name}`);
          }

          setShowLogin(false);
        } else {
          alert("Email hoặc mật khẩu không đúng!");
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

        <div className="login-popup-condition">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
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
