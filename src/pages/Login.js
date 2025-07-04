// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'; // Ensure this CSS is in src/styles
import {useAuth} from "../Authentication"

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleLogin = async () => {
    try {

      const response = await fetch('http://127.0.0.1:5000/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = {user: username}
        login(user)
        console.log(user)

        localStorage.setItem('currentUser', username);
        
        navigate(data.redirect || '/profile')
        //window.location.href = data.redirect; // or use navigate() with React Router
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="image-side"></div>
      <div className="form-side">
        <div className="login-container">
          <h2>Login</h2>

          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Login</button>
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
