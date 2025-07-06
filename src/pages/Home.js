// src/pages/Home.js

import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css'; // Make sure your CSS is moved to this folder
import '../styles/home.css';
import Marquee from "react-fast-marquee";

function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const systemNameInput = useRef(null);
  const username = localStorage.getItem('currentUser');

  useEffect(() => {
    if (showPopup && systemNameInput.current) {
      systemNameInput.current.focus();
    }
  }, [showPopup]);

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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  // Define the logos array (use your actual logo paths)
  const logos = [
    '/logos/r.png',
    'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    '/logos/howell.png',
    '/logos/Umaine.png',
    '/logos/Ankit.png',
  ];

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
          <button onClick={() => setShowPopup(true)}>+ Add System</button>
        </div>
      </nav>

      {/* Title and Start Button */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 36, marginBottom: 32
      }}>
        <h1 style={{
          fontFamily: "'Montserrat', 'Inter', 'Poppins', 'Segoe UI', sans-serif",
          fontWeight: 900,
          fontSize: '2.7em',
          letterSpacing: '2px',
          color: '#007acc',
          textShadow: '0 2px 18px #eaf6ff',
          marginBottom: 18,
          background: 'linear-gradient(90deg, #007acc 40%, #00c6fb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Real Time Sensor Data
        </h1>
        <a href="/run" style={{ textDecoration: 'none' }}>
          <button
            style={{
              background: 'linear-gradient(135deg, #007acc 60%, #00c6fb 100%)',
              color: '#fff',
              fontFamily: "'Montserrat', 'Inter', 'Poppins', 'Segoe UI', sans-serif",
              fontWeight: 800,
              fontSize: '1.3em',
              padding: '18px 44px',
              borderRadius: 14,
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 122, 204, 0.18)',
              letterSpacing: '1.2px',
              cursor: 'pointer',
              marginTop: 8,
              marginBottom: 8,
              transition: 'background 0.3s, transform 0.2s, box-shadow 0.2s',
              outline: 'none',
              animation: 'buttonFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #005f99 60%, #007acc 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(135deg, #007acc 60%, #00c6fb 100%)'}
          >
            Start Taking Images
          </button>
        </a>
      </div>

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

      {/* Animated Tech Logos Bar using react-fast-marquee */}
      <div className="tech-logos-bar">
        <Marquee gradient={false} speed={40} pauseOnHover={true}>
          {logos.map((logo, index) => (
            <img key={index} src={logo} alt={`Logo ${index % logos.length}`} className="logo" />
          ))}
        </Marquee>
      </div>
    </div>
  );
}

export default Home;
