import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css'; // Import global styles
import '../styles/home.css';   // Import home page-specific styles
import Marquee from "react-fast-marquee";

function Home() {
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

  // Logos to display in the marquee bar
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
            <button className="nav-dropdown-link" onClick={handleLogout}>Logout</button>
            <a href="/help" className="nav-dropdown-link">Help</a>
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

      {/* Page title and primary call-to-action button */}
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

      {/* Horizontal scrolling banner of tech logos */}
      <div className="tech-logos-bar">
        <Marquee gradient={false} speed={80} pauseOnHover={true}>
          {logos.map((logo, index) => (
            <img key={index} src={logo} alt={`Logo ${index % logos.length}`} className="logo" />
          ))}
        </Marquee>
      </div>

      {/* What this system does section */}
      <div className="features-section">
        <h2 className="section-title">What this system does?</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#007acc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#007acc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#007acc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Data Collector</h3>
            <p>Efficiently gathers sensor data from multiple sources in real-time</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="#007acc" strokeWidth="2"/>
                <rect x="9" y="9" width="6" height="6" stroke="#007acc" strokeWidth="2"/>
                <path d="M9 1v6" stroke="#007acc" strokeWidth="2"/>
                <path d="M15 1v6" stroke="#007acc" strokeWidth="2"/>
                <path d="M9 17v6" stroke="#007acc" strokeWidth="2"/>
                <path d="M15 17v6" stroke="#007acc" strokeWidth="2"/>
                <path d="M1 9h6" stroke="#007acc" strokeWidth="2"/>
                <path d="M17 9h6" stroke="#007acc" strokeWidth="2"/>
                <path d="M1 15h6" stroke="#007acc" strokeWidth="2"/>
                <path d="M17 15h6" stroke="#007acc" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Supported Sensors</h3>
            <p>Compatible with wide range of industrial and IoT sensors</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="#007acc" strokeWidth="2"/>
                <path d="M7 16l4-4 4 4 5-5" stroke="#007acc" strokeWidth="2"/>
                <path d="M17 11h3v3" stroke="#007acc" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Real-time Analysis</h3>
            <p>Instant processing and analysis of incoming sensor data</p>
          </div>
        </div>
      </div>

      {/* Why use it section */}
      <div className="benefits-section">
        <h2 className="section-title">Why use it?</h2>
        <div className="benefits-container">
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#00c6fb" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="#00c6fb" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Live Data</h3>
            <p>Monitor your sensors in real-time with instant updates</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00c6fb" strokeWidth="2"/>
                <path d="M3 9h18" stroke="#00c6fb" strokeWidth="2"/>
                <path d="M9 21V9" stroke="#00c6fb" strokeWidth="2"/>
              </svg>
            </div>
            <h3>User-Friendly Dashboard</h3>
            <p>Intuitive interface designed for easy monitoring and control</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00c6fb" strokeWidth="2"/>
                <path d="M9 12l2 2 4-4" stroke="#00c6fb" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Data Stored Securely</h3>
            <p>Your sensor data is protected with enterprise-grade security</p>
          </div>
        </div>
      </div>

      {/* Popup form for adding a new system */}
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

export default Home;