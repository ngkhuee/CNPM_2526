import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import { accounts } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
  const { login } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign Up");
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const navigate = useNavigate();
  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!agree) {
      alert("Please agree to the terms");
      return;
    }

    if (currState === "Sign Up") {
      login({ id: Date.now().toString(), name: data.name, email: data.email, role: "user" });
      alert("Account created!");
      setShowLogin(false);
      return;
    }

    const account = accounts.find(acc => acc.email === data.email && acc.password === data.password);
    if (!account) {
      alert("Email or password incorrect!");
      return;
    }

    login({ id: Date.now().toString(), name: account.name, email: account.email, role: account.role });

    if (account.role === "admin") {
      window.location.href = "http://localhost:5174/admin"; // redirect admin
    } else if (account.role === "restaurant") {
      navigate("/restaurant/dashboard"); // redirect restaurant dashboard
    } else {
      alert(`Logged in as ${account.name}`); // normal user
    }

    setShowLogin(false);
  };

  return (
    <div className="login-popup">
      <form onSubmit={onSubmit} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <span onClick={() => setShowLogin(false)} style={{ cursor: "pointer" }}>✖</span>
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input name="name" type="text" placeholder="Your Name" value={data.name} onChange={onChangeHandler} required />
          )}
          <input name="email" type="email" placeholder="Your Email" value={data.email} onChange={onChangeHandler} required />
          <input name="password" type="password" placeholder="Password" value={data.password} onChange={onChangeHandler} required />
        </div>

        <div className="login-popup-condition">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        <button type="submit">{currState === "Sign Up" ? "Create Account" : "Login"}</button>

        <p>
          {currState === "Sign Up" ? "Already have an account? " : "Create a new account? "}
          <span style={{ cursor: "pointer", color: "blue" }} onClick={() => setCurrState(currState === "Sign Up" ? "Login" : "Sign Up")}>
            {currState === "Sign Up" ? "Login here" : "Click here"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginPopup;
