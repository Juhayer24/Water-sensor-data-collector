//data.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import '../styles/data.css'; // Import data-specific styles

function Data() {
  const [showPopup, setShowPopup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const systemNameInput = useRef(null);
  const username = localStorage.getItem('currentUser');

  useEffect(() => {
    fetchSystemsData();
  }, []);

  const fetchSystemsData = async () => {
    if (!username) return;

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/get_systems_data?username=${username}`);
      const data = await response.json();
      setSystems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching systems data:', error);
      setLoading(false);
    }
  };

  const refreshSystemData = async (systemId) => {
    try {
      // Trigger new inference if desired (hook backend to this later)
      console.log(`Refreshing data for system ${systemId}`);
      fetchSystemsData();
    } catch (error) {
      console.error('Error refreshing system data:', error);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'clean':
        return { color: '#4CAF50', icon: '✓', text: 'Clean' };
      case 'dirty':
        return { color: '#FF9800', icon: '⚠', text: 'Dirty' };
      case 'empty':
        return { color: '#F44336', icon: '○', text: 'Empty' };
      default:
        return { color: '#9E9E9E', icon: '?', text: 'Unknown' };
    }
  };

  useEffect(() => {
    if (showPopup && systemNameInput.current) {
      systemNameInput.current.focus();
    }
  }, [showPopup]);

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await addSystem();
    }
  };

  const addSystem = async () => {
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
        fetchSystemsData();
      } else {
        alert('Failed to add system.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding system.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div className="data-page">
      {/* Navigation Bar */}
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
          <a href="/data" className="active">Data</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="nav-right">
          <button onClick={() => setShowPopup(true)}>+ Add System</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="data-content">
        <div className="data-header">
          <h1>Water Quality Dashboard</h1>
          <button className="refresh-all-btn" onClick={fetchSystemsData}>
             Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading system data...</p>
          </div>
        ) : systems.length === 0 ? (
          <div className="no-systems">
            <div className="no-systems-icon">📊</div>
            <h2>No Systems Found</h2>
            <p>Add your first water monitoring system to get started.</p>
            <button className="add-first-system-btn" onClick={() => setShowPopup(true)}>
              + Add Your First System
            </button>
          </div>
        ) : (
          <div className="systems-grid">
            {systems.map((system) => {
              const statusInfo = getStatusInfo(system.status);
              return (
                <div key={system.id} className="system-card">
                  <div className="system-header">
                    <h3>{system.name}</h3>
                    <button 
                      className="refresh-btn"
                      onClick={() => refreshSystemData(system.id)}
                      title="Refresh this system"
                    >
                      🔄
                    </button>
                  </div>

                  <div className="system-image-container">
                    <div className="image-placeholder">
                      <div className="camera-icon">💧</div>
                      <p>Water Quality Monitor</p>
                    </div>
                  </div>

                  <div className="status-section">
                    <div className={`status-indicator status-${system.status}`}>
                      <span className="status-icon">{statusInfo.icon}</span>
                      <span className="status-text">{statusInfo.text}</span>
                    </div>

                    <div className="confidence-bar">
                      <div className="confidence-label">
                        ML Confidence: {system.confidence}%
                      </div>
                      <div className="confidence-progress">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${system.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="system-footer">
                    <div className="last-updated">
                      Last analyzed: {new Date(system.lastUpdated).toLocaleString()}
                    </div>
                    <button 
                      className="analyze-btn"
                      onClick={() => refreshSystemData(system.id)}
                    >
                      Run New Analysis
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
            <button className="add-system-btn" onClick={addSystem}>
              Add System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Data;
