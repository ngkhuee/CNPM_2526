import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import login_bg from '../../assets/login_bg.png';

const restaurants = [
  { username: 'lotteria', password: '123456', name: 'Lotteria' },
  { username: '4p', password: '123456', name: '4Ps' },
  // Thêm nhà hàng khác nếu cần
];

const Login = ({ setCurrentUser }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = restaurants.find(
        (r) => r.username.toLowerCase() === username.toLowerCase() && r.password === password
        );

        if (user) {
        setCurrentUser(user.name); // cập nhật state ở App.jsx
        localStorage.setItem('loggedInRestaurant', JSON.stringify(user.name)); // lưu localStorage
        navigate('/dashboard'); // chuyển đến dashboard
        } else {
        setError('Username hoặc password sai!');
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
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log in</button>
    </form>
    </div>

  );
};

export default Login;
