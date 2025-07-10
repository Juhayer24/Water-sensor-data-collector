import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import '../styles/run.css';

function Run() {
  // State to store available systems the user can select from
  const [systems, setSystems] = useState([]);

  // Controls visibility of the "Add System" popup
  const [popupVisible, setPopupVisible] = useState(false);

  // Reference to the system name input field
  const systemNameInputRef = useRef(null);

  // Sampling settings
  const [duration, setDuration] = useState(''); // Duration of image capture
  const [durationUnit, setDurationUnit] = useState('minutes'); // Unit for duration

  const [samplingInterval, setSamplingInterval] = useState(''); // How often to take pictures
  const [samplingUnit, setSamplingUnit] = useState('seconds'); // Unit for sampling interval

  const [pictureCount, setPictureCount] = useState(0); // Estimated total images to be captured
  const [notice, setNotice] = useState('System Is Free'); // System status
  const [menuOpen, setMenuOpen] = useState(false); // Mobile nav dropdown

  // Logged-in user's username stored in localStorage
  const username = localStorage.getItem('currentUser');

  // Fetch user's systems when component mounts or username changes
  useEffect(() => {
    if (!username) return;

    fetch(`http://127.0.0.1:5000/get_systems?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => setSystems(data.systems || []));
  }, [username]);

  // Focus the input when the "Add System" popup is shown
  useEffect(() => {
    if (popupVisible && systemNameInputRef.current) {
      systemNameInputRef.current.focus();
    }
  }, [popupVisible]);

  // Helper function to convert various time units to seconds
  const convertToSeconds = (value, unit) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 0;

    switch (unit) {
      case 'seconds': return num;
      case 'minutes': return num * 60;
      case 'hours': return num * 3600;
      case 'days': return num * 86400;
      default: return 0;
    }
  };

  // Calculate total number of pictures to be taken based on user input
  useEffect(() => {
    const durationInSeconds = convertToSeconds(duration, durationUnit);
    const intervalInSeconds = convertToSeconds(samplingInterval, samplingUnit);

    if (durationInSeconds > 0 && intervalInSeconds > 0) {
      setPictureCount(Math.floor(durationInSeconds / intervalInSeconds));
    } else {
      setPictureCount(0);
    }
  }, [duration, durationUnit, samplingInterval, samplingUnit]);

  // Function to add a new system for the user
  const addSystem = async () => {
    const name = systemNameInputRef.current.value.trim();
    if (!name) return;

    const response = await fetch("http://127.0.0.1:5000/add_system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_name: name, username })
    });

    if (response.ok) {
      alert(`System "${name}" added.`);
      setPopupVisible(false);
      setSystems([...systems, name]);
    } else {
      alert("Failed to add system.");
    }
  };

  // Delete all systems associated with the current user
  const deleteAll = () => {
    fetch("http://127.0.0.1:5000/delete_all_systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    })
      .then(res => {
        if (res.ok) {
          setSystems([]); // Clear the system list in UI
        }
      });
  };

  // Starts the system for capturing images based on user configuration
  const start = (inf = false) => {
    setNotice("System Is In Use");

    const intervalInSeconds = convertToSeconds(samplingInterval, samplingUnit);
    const durationInSeconds = inf ? null : convertToSeconds(duration, durationUnit);

    // Validate inputs
    if (!intervalInSeconds || (!inf && !durationInSeconds)) return;

    const frequency = 60 / intervalInSeconds; // Convert interval to frequency (pictures per minute)
    const durationInMinutes = inf ? null : durationInSeconds / 60;

    // Basic safety checks to avoid overload
    if (frequency > 6 || (!inf && durationInMinutes <= 0)) return;

    fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: durationInMinutes, frequency })
    });
  };

  // Stop the system and mark it as free again
  const stop = () => {
    fetch("http://127.0.0.1:5000/stop");
    setNotice("System Is Free");
  };

  // Log the user out and redirect to login screen
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <div>
      {/* Navigation bar */}
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

      {/* Main content container */}
      <div className="container">
        <h2>Capture Images from Your System</h2>

        {/* System selection dropdown */}
        <label htmlFor="system">Select System:</label>
        <div className="input-row">
          <select id="system">
            {systems.length === 0 ? (
              <option>No systems found</option>
            ) : (
              systems.map((s, i) => <option key={i}>{s}</option>)
            )}
          </select>
          <button className="reset-btn" onClick={deleteAll} title="Delete all systems and refresh">
            Reset
          </button>
        </div>

        {/* Duration input */}
        <div className="input-group">
          <label htmlFor="duration">Duration of Sampling:</label>
          <div className="input-with-select">
            <input 
              type="number" 
              id="duration" 
              min="1" 
              step="1" 
              placeholder="e.g. 10" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
            />
            <select 
              value={durationUnit} 
              onChange={(e) => setDurationUnit(e.target.value)}
              className="unit-select"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        {/* Sampling interval input */}
        <div className="input-group">
          <label htmlFor="sampling-interval">Sampling Interval:</label>
          <div className="input-with-select">
            <input 
              type="number" 
              id="sampling-interval" 
              min="0.1" 
              step="0.1" 
              placeholder="e.g. 30" 
              value={samplingInterval} 
              onChange={(e) => setSamplingInterval(e.target.value)} 
            />
            <select 
              value={samplingUnit} 
              onChange={(e) => setSamplingUnit(e.target.value)}
              className="unit-select"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        {/* Display estimated number of pictures */}
        <div className="picture-count-row">
          <span id="pictureCount">Total Pictures: {pictureCount}</span>
        </div>

        {/* Action buttons */}
        <div className="button-row">
          <button onClick={() => start(true)}>Run Infinitely</button>
          <button onClick={() => start(false)}>Start</button>
          <button onClick={stop}>Stop</button>
        </div>

        {/* System status */}
        <p id="notice">{notice}</p>
      </div>

      {/* Popup to add a new system */}
      {popupVisible && (
        <div className="popup">
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

export default Run;
