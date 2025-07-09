import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/reset.css'; // You'll need to create this CSS file

function Reset() {
  const [step, setStep] = useState(1); // 1: email, 2: code verification, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const handleBackToLogin = () => {
    navigate('/login');
  };

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
      <div className="image-side"></div>
      <div className="form-side">
        <div className="reset-container">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          
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