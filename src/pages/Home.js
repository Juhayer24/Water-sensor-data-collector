// src/pages/Home.js

import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css'; // Make sure your CSS is moved to this folder

function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const systemNameInput = useRef(null);

  useEffect(() => {
    if (showPopup && systemNameInput.current) {
      systemNameInput.current.focus();
    }
  }, [showPopup]);

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      const systemName = systemNameInput.current.value.trim();
      if (systemName === '') return;

      try {
        const response = await fetch('http://127.0.0.1:5000/add_system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ system_name: systemName }),
        });

        if (response.ok) {
          alert(`System "${systemName}" added.`);
          systemNameInput.current.value = '';
          setShowPopup(false);
          window.location.href = '/run'; // Use React Router in production
        } else {
          alert('Failed to add system.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error adding system.');
      }
    }
  };

  return (
    <div>
      <nav>
        <div className="nav-left">
          <a href="/home">Home</a>
          <a href="/run">Take Images</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="nav-right">
          <button onClick={() => setShowPopup(true)}>+ Add System</button>
        </div>
      </nav>

      {/* Add System Popup */}
      {showPopup && (
        <div id="add_system_popup" className="popup" style={{ display: 'flex' }}>
          <div className="popup-content">
            <span className="close-button" onClick={() => setShowPopup(false)}>&times;</span>
            <p>Enter System Name</p>
            <input
              type="text"
              id="systemNameInput"
              placeholder="e.g. Camera_1"
              ref={systemNameInput}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
