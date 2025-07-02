// src/pages/Run.js
import React, { useEffect, useRef, useState } from 'react';
import '../styles/global.css';
import '../styles/run.css';

function Run() {
  const [systems, setSystems] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const systemNameInputRef = useRef(null);
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState('');
  const [pictureCount, setPictureCount] = useState(0);
  const [notice, setNotice] = useState('System Is Free');

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_systems")
      .then((res) => res.json())
      .then((data) => setSystems(data.systems || []));
  }, []);

  useEffect(() => {
    if (popupVisible && systemNameInputRef.current) {
      systemNameInputRef.current.focus();
    }
  }, [popupVisible]);

  useEffect(() => {
    const dur = parseFloat(duration);
    const freq = parseFloat(frequency);
    if (!isNaN(dur) && !isNaN(freq) && dur > 0 && freq > 0) {
      setPictureCount(Math.floor(dur * freq));
    } else {
      setPictureCount(0);
    }
  }, [duration, frequency]);

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
      setSystems([...systems, name]);
    } else {
      alert("Failed to add system.");
    }
  };

  const deleteAll = () => {
    fetch("http://127.0.0.1:5000/delete_all_systems", { method: "POST" })
      .then(res => res.ok && setSystems([]));
  };

  const start = (inf = false) => {
    setNotice("System Is In Use");
    let freq = parseFloat(frequency);
    let dur = inf ? null : parseFloat(duration);
    if (!freq || (!inf && !dur)) return;
    if (freq > 6 || (!inf && dur <= 0)) return;

    fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: dur, frequency: freq })
    });
  };

  const stop = () => {
    fetch("http://127.0.0.1:5000/stop");
    setNotice("System Is Free");
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
          <button className="refresh-btn" onClick={deleteAll} title="Delete all systems and refresh">
            &#x21bb;
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="duration">Duration (minutes):</label>
          <input type="number" id="duration" min="1" step="1" placeholder="e.g. 10" value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>

        <div className="input-group">
          <label htmlFor="frequency">Images per minute:</label>
          <input type="number" id="frequency" min="0.1" max="6" step="0.1" placeholder="e.g. 2.5" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
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
