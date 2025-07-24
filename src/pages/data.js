import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css'; // Import global styles

function Data() {
  const [showPopup, setShowPopup] = useState(false); // Controls the visibility of the "Add System" popup
  const [menuOpen, setMenuOpen] = useState(false);   // Toggles mobile dropdown menu
  const systemNameInput = useRef(null);              // Ref to input field inside the popup
  const username = localStorage.getItem('currentUser'); // Retrieve logged-in user from local storage

  // Automatically focus the input field when popup opens
  useEffect(() => {
    if (showPopup && systemNameInput.current) {
      systemNameInput.current.focus();
    }
  }, [showPopup]);

  // Handle "Enter" key press when typing in the popup input field
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      const systemName = systemNameInput.current.value.trim();
      if (systemName === '' || !username) return;

      try {
        const response = await fetch('http://127.0.0.1:5000/add_system', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ system_name: systemName, username }),
        });

        if (response.ok) {
          alert(`System "${systemName}" added.`);
          systemNameInput.current.value = '';
          setShowPopup(false);
          window.location.href = '/run'; // Navigate to the image-taking page
        } else {
          alert('Failed to add system.');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error adding system.');
      }
    }
  };

  // Logout the user and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div>
      {/* Navigation bar - same as home page */}
      <nav>
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          &#9776;
        </button>
        {menuOpen && (
          <div className="nav-dropdown">
            <button className="nav-dropdown-link" onClick={handleLogout}>Logout</button>
            <a href="/help" className="nav-dropdown-link">Help</a>
          </div>
        )}
        <div className="nav-center">
          <a href="/home">Home</a>
          <a href="/run">Take Images</a>
          <a href="/data">Data</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="nav-right">
          <button onClick={() => setShowPopup(true)}>+ Add System</button>
        </div>
      </nav>

      {/* Popup form for adding a new system - same as home page */}
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
            <button className="add-system-btn" onClick={async () => {
              const systemName = systemNameInput.current.value.trim();
              if (systemName === '' || !username) return;
              try {
                const response = await fetch('http://127.0.0.1:5000/add_system', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ system_name: systemName, username }),
                });
                if (response.ok) {
                  alert(`System "${systemName}" added.`);
                  systemNameInput.current.value = '';
                  setShowPopup(false);
                  window.location.href = '/run';
                } else {
                  alert('Failed to add system.');
                }
              } catch (err) {
                console.error('Error:', err);
                alert('Error adding system.');
              }
            }}>Add System</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Data;