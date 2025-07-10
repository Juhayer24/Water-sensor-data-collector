import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'; // Login page-specific styles
import { useAuth } from "../Authentication"

function Login() {
  const [username, setUsername] = useState(''); // Stores entered username
  const [password, setPassword] = useState(''); // Stores entered password
  const { login } = useAuth(); // Access login function from authentication context
  const navigate = useNavigate(); // Used to programmatically navigate pages

  // Handles login when user clicks the login button or submits the form
  const handleLogin = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission
    try {
      const response = await fetch('http://127.0.0.1:5000/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = { user: username };
        login(user); // Update auth state
        console.log(user);

        localStorage.setItem('currentUser', username); // Save user locally

        // Navigate to redirect path or default to /profile
        navigate(data.redirect || '/profile');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong');
    }
  };

  // Navigate to password reset page
  const handleForgotPassword = () => {
    navigate('/reset');
  };

  return (
    <div className="login-wrapper">
      {/* Side image panel for visual design */}
      <div className="image-side"></div>

      {/* Login form container */}
      <div className="form-side">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
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

            <button type="submit">Login</button>
          </form>
          
          {/* Link to password reset */}
          <button 
            type="button" 
            className="forgot-password-btn"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
          
          {/* Link to sign up page */}
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
