import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import "./ResetPassword.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- important!
function ResetPassword() {
  // --- Hooks for State Management ---
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Error States ---
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // --- Hook for Navigation ---
  const navigate = useNavigate();

  // --- Helper Validation Functions ---
  const validateEmail = () => {
    setEmailError('');
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    setOtpError('');
    if (!otp || otp.length !== 6) { // Assuming a 6-digit OTP
      setOtpError('Please enter a valid 6-digit OTP.');
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    setPasswordError('');
    setConfirmPasswordError('');
    let isValid = true;

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }
    return isValid;
  };

  // --- Step 1 Handler: Send OTP ---
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (validateEmail()) {
      axios.post("http://localhost:5000/smartmandi/user/sendOtp",{
        "email":email
      }).then(toast.success("OTP sent successfully!", { position: "top-right" }))
      setStep(2); // Move to OTP verification step
    }
  };

  // --- Step 2 Handler: Verify OTP ---
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (validateOtp()) {
      axios.post("http://localhost:5000/smartmandi/user/verifyOtp",{
        "otp":otp,
        "email":email
      }).then(response => {
        if(response.data.status)
          toast.success("OTP verified successfully!", { position: "top-right" })
          setStep(3); // Move to New Password setup step
      }  
      ).catch(error=>{
        toast.error("Wrong OTP!", { position: "top-right" })})
    }
  };

  // --- Step 3 Handler: Reset Password ---
  const handleResetPassword = (e) => {
    e.preventDefault();
    if (validatePasswords()) {
      axios.put("http://localhost:5000/smartmandi/updatePassword",{
        "email":email,
        "password":newPassword
      }).then(response=>{
        toast.success("Password reset successful!", { position: "top-right" })
        navigate('/login'); // Navigate back to the login page
      })
      
    }
  };
  
  // --- Back to Login Handler ---
  const handleBackToLogin = () => {
    navigate('/login');
  };

  // --- Conditional Render Content based on Step ---
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp} className="reset-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? 'input-error' : ''}
              />
              {emailError && <p className="error-message">{emailError}</p>}
            </div>
            
            <button type="submit" className="reset-button">
              Send OTP to Email
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOtp} className="reset-form">
            <p className="instruction-text">
              An OTP has been sent to your email ({email}).
            </p>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))} // Limit input to 6
                className={otpError ? 'input-error' : ''}
                maxLength="6"
              />
              {otpError && <p className="error-message">{otpError}</p>}
            </div>
            
            <button type="submit" className="reset-button">
              Verify OTP
            </button>
            <p className="resend-otp-link">
              Didn't receive it? <a href="#" onClick={() => handleSendOtp({preventDefault: () => {}})}>Resend OTP</a>
            </p>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="reset-form">
            <div className="input-group">
              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={passwordError ? 'input-error' : ''}
              />
              {passwordError && <p className="error-message">{passwordError}</p>}
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={confirmPasswordError ? 'input-error' : ''}
              />
              {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
            </div>

            <button type="submit" className="reset-button">
              Reset Password
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2 className="logo-text">SmartMandi</h2>
        <p className="welcome-text">
          {step === 3 ? 'Set New Password' : step === 2 ? 'Verify Security Code' : 'Reset Password'}
        </p>
        
        {renderContent()}

        <div className="separator">
          <p>...</p>
        </div>

        <button 
          onClick={handleBackToLogin} 
          className="back-to-login-button"
        >
          Back to Login
        </button>
      </div>
      <ToastContainer/>
    </div>
  );
}

export default ResetPassword;