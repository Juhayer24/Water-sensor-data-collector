import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import '../styles/run.css';

function Run() {
  const [systems, setSystems] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const systemNameInputRef = useRef(null);
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState('minutes');
  const [samplingInterval, setSamplingInterval] = useState('');
  const [samplingUnit, setSamplingUnit] = useState('seconds');
  const [pictureCount, setPictureCount] = useState(0);
  const [notice, setNotice] = useState('System Is Free');
  const [menuOpen, setMenuOpen] = useState(false);
  const username = localStorage.getItem('currentUser');

  useEffect(() => {
    if (!username) return;
    fetch(`http://127.0.0.1:5000/get_systems?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => setSystems(data.systems || []));
  }, [username]);

  useEffect(() => {
    if (popupVisible && systemNameInputRef.current) {
      systemNameInputRef.current.focus();
    }
  }, [popupVisible]);

  // Convert time to seconds
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

  // Calculate picture count based on duration and sampling interval
  useEffect(() => {
    const durationInSeconds = convertToSeconds(duration, durationUnit);
    const intervalInSeconds = convertToSeconds(samplingInterval, samplingUnit);
    
    if (durationInSeconds > 0 && intervalInSeconds > 0) {
      setPictureCount(Math.floor(durationInSeconds / intervalInSeconds));
    } else {
      setPictureCount(0);
    }
  }, [duration, durationUnit, samplingInterval, samplingUnit]);

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

  const deleteAll = () => {
    fetch("http://127.0.0.1:5000/delete_all_systems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    })
      .then(res => {
        if (res.ok) {
          setSystems([]);
        }
      });
  };

  const start = (inf = false) => {
    setNotice("System Is In Use");
    
    const intervalInSeconds = convertToSeconds(samplingInterval, samplingUnit);
    const durationInSeconds = inf ? null : convertToSeconds(duration, durationUnit);
    
    if (!intervalInSeconds || (!inf && !durationInSeconds)) return;
    
    // Convert interval to frequency (images per minute)
    const frequency = 60 / intervalInSeconds;
    
    // Convert duration to minutes
    const durationInMinutes = inf ? null : durationInSeconds / 60;
    
    if (frequency > 6 || (!inf && durationInMinutes <= 0)) return;

    fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: durationInMinutes, frequency: frequency })
    });
  };

  const stop = () => {
    fetch("http://127.0.0.1:5000/stop");
    setNotice("System Is Free");
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
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

      <div className="container">
        <h2>Capture Images from Your System</h2>

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

        <div className="picture-count-row">
          <span id="pictureCount">Total Pictures: {pictureCount}</span>
        </div>

        <div className="button-row">
          <button onClick={() => start(true)}>Run Infinitely</button>
          <button onClick={() => start(false)}>Start</button>
          <button onClick={stop}>Stop</button>
        </div>

        <p id="notice">{notice}</p>
      </div>

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