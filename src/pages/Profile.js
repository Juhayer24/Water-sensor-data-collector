import React, { useEffect, useState, useRef } from 'react';
import '../styles/global.css';
import '../styles/profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [systems, setSystems] = useState([]);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const systemNameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const username = localStorage.getItem('currentUser');
    if (!username) {
      setMessage('Please log in to view your profile.');
      return;
    }

    // Fetch user profile
    fetch(`http://127.0.0.1:5000/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserData(data.user);
          // Try to fetch profile photo
          fetch(`http://127.0.0.1:5000/profile_photo/${encodeURIComponent(username)}`)
            .then((res) => {
              if (res.ok) return res.blob();
              else throw new Error('No photo');
            })
            .then((blob) => {
              setProfilePhoto(URL.createObjectURL(blob));
            })
            .catch(() => setProfilePhoto(null));
        } else {
          setMessage(data.message || 'Profile not found.');
        }
      });

    // Fetch user systems
    setSystemsLoading(true);
    fetch(`http://127.0.0.1:5000/get_systems?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        setSystems(data.systems || []);
        setSystemsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const addSystem = async () => {
    const name = systemNameInputRef.current.value.trim();
    if (!name) return;
    const username = localStorage.getItem('currentUser');
    const response = await fetch("http://127.0.0.1:5000/add_system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_name: name, username })
    });
    if (response.ok) {
      alert(`System "${name}" added.`);
      setPopupVisible(false);
      // Refresh systems list
      setSystemsLoading(true);
      fetch(`http://127.0.0.1:5000/get_systems?username=${encodeURIComponent(username)}`)
        .then((res) => res.json())
        .then((data) => {
          setSystems(data.systems || []);
          setSystemsLoading(false);
        });
    } else {
      alert("Failed to add system.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    const username = localStorage.getItem('currentUser');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('photo', file);
    fetch('http://127.0.0.1:5000/upload_profile_photo', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Refresh photo
          fetch(`http://127.0.0.1:5000/profile_photo/${encodeURIComponent(username)}?t=${Date.now()}`)
            .then((res) => res.blob())
            .then((blob) => {
              setProfilePhoto(URL.createObjectURL(blob));
              setPhotoLoading(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
            });
        } else {
          alert('Failed to upload photo.');
          setPhotoLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      });
  };

  const handleRemovePhoto = () => {
    const username = localStorage.getItem('currentUser');
    setPhotoLoading(true);
    fetch('http://127.0.0.1:5000/remove_profile_photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfilePhoto(null);
        } else {
          alert('Failed to remove photo.');
        }
        setPhotoLoading(false);
      });
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
              <div className="profile-photo-wrapper">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="profile-photo"
                    style={{ opacity: photoLoading ? 0.5 : 1 }}
                  />
                ) : (
                  <div className="profile-photo placeholder" style={{ opacity: photoLoading ? 0.5 : 1 }}>
                    <span role="img" aria-label="No Photo" style={{ fontSize: '2.5em', color: '#b36aff' }}>👤</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <div className="photo-btn-row">
                  <button
                    className="upload-photo-btn"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={photoLoading}
                  >
                    {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {profilePhoto && (
                    <button
                      className="remove-photo-btn"
                      onClick={handleRemovePhoto}
                      disabled={photoLoading}
                    >Remove Photo</button>
                  )}
                </div>
              </div>
              <h2>Welcome, {userData.username}!</h2>
              <div className="profile-info">
                <div><span>Username:</span> {userData.username}</div>
                <div><span>Email:</span> {userData.email}</div>
                <div style={{ marginTop: 18 }}>
                  <span>Systems:</span>{' '}
                  {systemsLoading ? (
                    <span>Loading...</span>
                  ) : systems.length === 0 ? (
                    <span>No systems added</span>
                  ) : (
                    <select style={{ fontSize: '1em', padding: '4px 10px', borderRadius: 6 }}>
                      {systems.map((sys, idx) => (
                        <option key={idx} value={sys}>{sys}</option>
                      ))}
                    </select>
                  )}
                  <span style={{ marginLeft: 10, color: '#b36aff', fontWeight: 600 }}>
                    {systems.length > 0 && `(${systems.length})`}
                  </span>
                </div>
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