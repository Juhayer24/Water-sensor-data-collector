// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import '../styles/global.css';
import '../styles/profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');

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

  return (
    <div>
      <nav>
        <div className="nav-left">
          <a href="/home">Home</a>
          <a href="/run">Take Images</a>
          <a href="/profile">Profile</a>
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
    </div>
  );
}

export default Profile;