// src/pages/Signup.js
import React, { useState } from 'react';
import '../styles/global.css';
import '../styles/login.css';
import '../styles/signup.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (data.success) {
      alert("Account created! Please log in.");
      window.location.href = "/login";
    } else {
      alert(data.message || "Signup failed.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="image-side"></div>
      <div className="form-side">
        <div className="login-container">
          <h2>Sign Up</h2>

          <label htmlFor="signup-username">Username</label>
          <input
            type="text"
            id="signup-username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSignup}>Sign Up</button>

          <p className="signup-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;