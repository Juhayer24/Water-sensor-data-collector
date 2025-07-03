// src/pages/Profile.js
import React, { useEffect, useState, useRef } from 'react';
import '../styles/global.css';
import '../styles/profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const systemNameInputRef = useRef(null);

  useEffect(() => {
    const username = localStorage.getItem('currentUser');
    if (!username) {
      setMessage('Please log in to view your profile.');
      return;
    }

    fetch(`http://127.0.0.1:5000/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserData(data.user);
        } else {
          setMessage(data.message || 'Profile not found.');
        }
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const addSystem = async () => {
    const name = systemNameInputRef.current.value.trim();
    if (!name) return;
    const response = await fetch("http://127.0.0.1:5000/add_system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_name: name })
    });
    if (response.ok) {
      alert(`System "${name}" added.`);
      setPopupVisible(false);
    } else {
      alert("Failed to add system.");
    }
  };

  return (
    <div>
      <nav style={{ position: 'relative' }}>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          &#9776;
        </button>
        {menuOpen && (
          <div className="nav-dropdown">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
        <div className="nav-center">
          <a href="/home">Home</a>
          <a href="/run">Take Images</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="nav-right">
          <button onClick={() => setPopupVisible(true)}>+ Add System</button>
        </div>
      </nav>
      <div className="profile-container">
        <div id="profile-content">
          {message && <p>{message}</p>}
          {userData && (
            <div className="profile-card">
              <h2>Welcome, {userData.username}!</h2>
              <div className="profile-info">
                <div><span>Username:</span> {userData.username}</div>
                <div><span>Email:</span> {userData.email}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {popupVisible && (
        <div className="popup" style={{ display: 'flex' }}>
          <div className="popup-content">
            <span className="close-button" onClick={() => setPopupVisible(false)}>&times;</span>
            <p>Enter System Name</p>
            <input type="text" ref={systemNameInputRef} placeholder="e.g. Camera_1" />
            <button className="add-system-btn" onClick={addSystem}>Add System</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;