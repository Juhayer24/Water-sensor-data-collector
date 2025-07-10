import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/reset.css'; // Custom styling for reset password page

function Reset() {
  const [step, setStep] = useState(1); // Controls which step of the reset process user is on
  const [email, setEmail] = useState(''); // Stores user's email
  const [code, setCode] = useState(''); // Stores verification code input
  const [newPassword, setNewPassword] = useState(''); // Stores new password
  const [confirmPassword, setConfirmPassword] = useState(''); // Stores confirmation of new password
  const [loading, setLoading] = useState(false); // Indicates if async action is in progress
  const [message, setMessage] = useState(''); // Feedback message shown to user
  const navigate = useNavigate(); // Navigation hook for redirecting

  // Sends a reset code to the user's email
  const handleSendCode = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Reset code sent to your email');
        setStep(2);
      } else {
        setMessage(data.message || 'Failed to send reset code');
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verifies the code sent to user's email
  const handleVerifyCode = async () => {
    if (!code) {
      setMessage('Please enter the verification code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/verify_reset_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Code verified successfully');
        setStep(3);
      } else {
        setMessage(data.message || 'Invalid or expired code');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submits the new password to complete the reset
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:5000/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirects user back to login page
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Step 1: Request reset code
  const renderStep1 = () => (
    <div className="reset-step">
      <h2>Reset Password</h2>
      <p>Enter your email address and we'll send you a verification code</p>

      <label htmlFor="email">Email Address</label>
      <input
        type="email"
        id="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleSendCode} disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Code'}
      </button>

      <button type="button" className="back-btn" onClick={handleBackToLogin}>
        Back to Login
      </button>
    </div>
  );

  // Step 2: Verify code
  const renderStep2 = () => (
    <div className="reset-step">
      <h2>Verify Code</h2>
      <p>Enter the 6-digit code sent to {email}</p>

      <label htmlFor="code">Verification Code</label>
      <input
        type="text"
        id="code"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength="6"
        disabled={loading}
      />

      <button onClick={handleVerifyCode} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <button type="button" className="back-btn" onClick={() => setStep(1)}>
        Back to Email
      </button>
    </div>
  );

  // Step 3: Set new password
  const renderStep3 = () => (
    <div className="reset-step">
      <h2>Set New Password</h2>
      <p>Enter your new password</p>

      <label htmlFor="newPassword">New Password</label>
      <input
        type="password"
        id="newPassword"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={loading}
      />

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />

      <button onClick={handleResetPassword} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>

      <button type="button" className="back-btn" onClick={() => setStep(2)}>
        Back to Code
      </button>
    </div>
  );

  return (
    <div className="reset-wrapper">
      <div className="image-side"></div> {/* Decorative image panel */}
      <div className="form-side">
        <div className="reset-container">
          {/* Render appropriate step */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Display success or error message */}
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reset;
