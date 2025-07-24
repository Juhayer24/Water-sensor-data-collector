import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import all the main page components of your app
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Reset from "./pages/reset";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Run from "./pages/Run";
import Help from "./pages/help";
import Data from "./pages/data"; // Import the new Data page

// This component protects routes that require the user to be logged in
import ProtectedRoute from "./Protect_Route";

import "./styles/global.css"; // Global CSS styles for your entire app

function App() {
  return (
    // Router wraps the entire app and enables client-side routing
    <Router>
      {/* Routes component contains all the route definitions */}
      <Routes>

        {/* Redirect root URL "/" to "/login" page */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes: accessible without logging in */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset" element={<Reset />} />

        {/* Protected routes: accessible only if logged in */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/run" 
          element={
            <ProtectedRoute>
              <Run />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/help" 
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/data" 
          element={
            <ProtectedRoute>
              <Data />
            </ProtectedRoute>
          } 
        />

        {/* Fallback route: shows 404 message for any unknown URL */}
        <Route path="*" element={<h2>404 Not Found</h2>} />

      </Routes>
    </Router>
  );
}

export default App;
