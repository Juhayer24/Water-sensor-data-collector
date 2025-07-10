import React, { useEffect, useState, useRef } from 'react';
import '../styles/global.css';
import '../styles/profile.css';

function Profile() {
  const [userData, setUserData] = useState(null);           // Stores user profile data
  const [message, setMessage] = useState('');               // Stores message (e.g., login reminder)
  const [menuOpen, setMenuOpen] = useState(false);          // Controls hamburger menu visibility
  const [popupVisible, setPopupVisible] = useState(false);  // Controls add system popup visibility
  const [profilePhoto, setProfilePhoto] = useState(null);   // Stores profile photo as URL blob
  const [photoLoading, setPhotoLoading] = useState(false);  // Indicates if photo is uploading/deleting
  const [systems, setSystems] = useState([]);               // List of user's systems
  const [systemsLoading, setSystemsLoading] = useState(true); // Indicates if systems are being loaded

  const systemNameInputRef = useRef(null); // Ref to system name input field in popup
  const fileInputRef = useRef(null);       // Ref to hidden file input for photo upload

  useEffect(() => {
    const username = localStorage.getItem('currentUser');
    if (!username) {
      setMessage('Please log in to view your profile.');
      return;
    }

    // Fetch user profile data
    fetch(`http://127.0.0.1:5000/profile?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUserData(data.user);

          // Try fetching profile photo
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

    // Fetch systems associated with the user
    setSystemsLoading(true);
    fetch(`http://127.0.0.1:5000/get_systems?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        setSystems(data.systems || []);
        setSystemsLoading(false);
      });
  }, []);

  // Logs out the user and redirects to login
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  // Navigates to password reset page
  const handleResetPassword = () => {
    window.location.href = '/reset';
  };

  // Adds a new system for the user
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

      // Refresh the list of systems after adding
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

  // Uploads a new profile photo
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
          // Reload the photo with a fresh timestamp to bust cache
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

  // Removes the current profile photo
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
      {/* Navigation Bar */}
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
          <button onClick={() => setPopupVisible(true)}>+ Add System</button>
        </div>
      </nav>

      {/* Main Profile Content */}
      <div className="profile-container">
        <div id="profile-content">
          {message && <p>{message}</p>}

          {userData && (
            <div className="profile-card">
              {/* Profile Photo Section */}
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

                {/* Hidden File Input */}
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

              {/* Welcome + User Info */}
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

              {/* Reset Password Button */}
              <div className="profile-actions">
                <button className="reset-password-btn" onClick={handleResetPassword}>
                  Reset Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add System Popup */}
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
