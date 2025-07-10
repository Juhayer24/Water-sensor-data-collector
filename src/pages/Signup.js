import React, { useState } from 'react';
import '../styles/global.css';
import '../styles/login.css';
import '../styles/signup.css';

function Signup() {
  // State variables to hold user inputs for signup form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle signup when user clicks the "Sign Up" button
  const handleSignup = async () => {
    // Basic validation: check if any field is empty
    if (!username || !email || !password) {
      alert("Please fill in all fields.");  // Prompt user to complete the form
      return;  // Stop further execution if validation fails
    }

    // Send signup data to backend API
    const response = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",  // HTTP POST to submit data
      headers: { "Content-Type": "application/json" },  // Tell server we are sending JSON
      body: JSON.stringify({ username, email, password })  // Convert data to JSON string
    });

    // Parse JSON response from the server
    const data = await response.json();

    // Check if signup was successful
    if (data.success) {
      alert("Account created! Please log in.");  // Notify user of success
      window.location.href = "/login";  // Redirect user to login page
    } else {
      // Show error message from server or generic failure message
      alert(data.message || "Signup failed.");
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left side can have an image or decoration */}
      <div className="image-side"></div>

      {/* Right side holds the signup form */}
      <div className="form-side">
        <div className="login-container">
          <h2>Sign Up</h2>

          {/* Username input */}
          <label htmlFor="signup-username">Username</label>
          <input
            type="text"
            id="signup-username"
            placeholder="Choose a username"
            value={username}  // Controlled input tied to state
            onChange={(e) => setUsername(e.target.value)}  // Update state on user input
          />

          {/* Email input */}
          <label htmlFor="signup-email">Email</label>
          <input
            type="email"
            id="signup-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password input */}
          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Submit button triggers signup */}
          <button onClick={handleSignup}>Sign Up</button>

          {/* Link for users who already have an account */}
          <p className="signup-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
