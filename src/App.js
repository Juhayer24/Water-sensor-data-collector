import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import all your pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Reset from "./pages/reset";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Run from "./pages/Run";
import ProtectedRoute from "./Protect_Route";

import "./styles/global.css"; // Add any global styles here

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>} />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>} />

        <Route path="/run" element={
          <ProtectedRoute>
            <Run />
          </ProtectedRoute>} />
        
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
