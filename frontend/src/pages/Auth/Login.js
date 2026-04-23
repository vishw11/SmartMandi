import React, { useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom'; 
import axios from "axios"
import "./Login.css"

function Login() {
  // --- Hooks for State Management ---
  const { role } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [dataError, setDataError] = useState('');
  // --- Hook for Navigation ---
  const navigate = useNavigate();

  // --- Validation Logic ---
  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setDataError('');

    // Basic Email Validation
    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      isValid = false;
    }

    // Basic Password Validation
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      isValid = false;
    }

    return isValid;
  };

  // --- Form Submission Handler ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // **Client-side validation passed!**
      console.log('Login attempt with:', { email, password });
      axios.post(`http://localhost:5000/smartmandi/${role}/login`,{
          "email":email,
          "password":password
        })
      .then(res=>{
        if(localStorage.getItem("id")!=null)
          localStorage.removeItem("id")
        if(localStorage.getItem("name")!=null)
          localStorage.removeItem("name")
        localStorage.setItem("id",res.data.Id)
        localStorage.setItem("name",res.data.name)
        navigate(`/${role}/dashboard`); // Navigate to a dashboard or main page
      }).catch(err=>{
        setDataError('Either email or password is wrong')
      })
      
    } else {
      console.log('Validation failed.');
    }
  };
  
  // --- Navigation to Sign Up ---
  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/register'); // Navigate to the Sign Up page
  };
  const handleForgotPassword = () => {
      setTimeout(() => {
          navigate('/reset-password');
      }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="logo-text">SmartMandi</h2>
        <p className="welcome-text">Welcome, { role }!</p>
        
        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="input-group">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordError ? 'input-error' : ''}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

          <div className="forgot-password-container">
            {dataError && <center><p className="error-message">{dataError}</p></center>}
            <a href="/reset-password" className="forgot-password-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <div className="separator">
          <p></p>
        </div>

        <button 
          onClick={handleSignUp} 
          className="signup-link-button"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}

export default Login;
