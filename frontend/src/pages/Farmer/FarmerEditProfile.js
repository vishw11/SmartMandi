import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./FarmerEditProfile.css"
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faChartLine, faShoppingBasket, faCog, faSignOutAlt,
    faUser, faMapMarkerAlt, faShippingFast, faCheckCircle, faTimesCircle,
    faExclamationTriangle, faMoneyBillWave, faTruck
} from '@fortawesome/free-solid-svg-icons';
// --- MOCK INITIAL DATA ---

function FarmerEditProfile() {
  const navigate = useNavigate();

  // --- STATE HOOKS (Initialised with data for edit) ---
  // Personal & Contact
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Primary Address
  const [city, setCity] = useState('');
  const [stateDistrict, setStateDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  // Banking Information
  const [accountHolderName, setAccountHolderName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [res,setRes] = useState({});
  // Error and Loading States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // --- 1. DATA FETCHING (Simulated) ---
  useEffect(() => {
    // Simulate fetching user data from API
    try {
            const id=localStorage.getItem("id")
            axios.get(`http://localhost:5000/smartmandi/user/farmer/${id}`).then(response=>{
              setRes(response.data)
              setFullName(response.data.fullName);
              setEmail(response.data.email);
              setPhoneNumber(response.data.phoneNumber);
              setCity(response.data.city);
              setStateDistrict(response.data.district);
              setPincode(response.data.pincode);
              setLandmark(response.data.landmark);
              if(response.data.accountHolderName!=undefined || response.data.accountHolderName!=null)
                setAccountHolderName(response.data.accountHolderName);
              if(response.data.ifscCode!=undefined || response.data.ifscCode!=null)
                setIfscCode(response.data.ifscCode);
              if(response.data.bankAccountNumber!=undefined || response.data.bankAccountNumber!=null)
                setAccountNumber(response.data.bankAccountNumber);
            })
        } catch (apiError) {
            alert('Failed to fetch user details.');
        }
  }, []); 

  // --- 2. VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Personal & Contact Validation
    if (!fullName.trim()) { newErrors.fullName = 'Full Name is required.'; isValid = false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Valid Email is required.'; isValid = false; }
    if (!phoneNumber.trim() || !/^\d{10,15}$/.test(phoneNumber.replace(/[+ \-]/g, ''))) { newErrors.phoneNumber = 'Valid Phone Number is required.'; isValid = false; }

    // Address Validation
    if (!city.trim()) { newErrors.city = 'City is required.'; isValid = false; }
    if (!stateDistrict.trim()) { newErrors.stateDistrict = 'State/District is required.'; isValid = false; }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) { newErrors.pincode = 'Valid 6-digit Pincode is required.'; isValid = false; }

    // Banking Validation
    if (!accountHolderName.trim()) { newErrors.accountHolderName = 'Account Holder Name is required.'; isValid = false; }
    if (!ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) { newErrors.ifscCode = 'Valid IFSC Code is required.'; isValid = false; }
    if (!accountNumber.trim() || !/^\d{9,18}$/.test(accountNumber)) { newErrors.accountNumber = 'Valid Account Number is required.'; isValid = false; }


    setErrors(newErrors);
    return isValid;
  };

  // --- 3. SUBMISSION HANDLER (Update Profile) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const profileData = 
      {
        "fullName": fullName,
        "email": email,
        "phoneNumber": phoneNumber,
        "city": city,
        "pincode": pincode,
        "landmark": landmark,
        "bankAccountNumber": accountNumber,
        "ifscCode": ifscCode,
        "accountHolderName": accountHolderName
      }
      try {
            const id=localStorage.getItem("id")
            axios.put(`http://localhost:5000/smartmandi/update/farmer/${id}`,profileData).then(()=>{
              alert('Profile updated successfully!');
              navigate("/farmer/dashboard");
            })
        } catch (apiError) {
            alert('Failed to update user details.');
        }
      
      // Optionally navigate away, but often profiles stay on the page after update
    } else {
      console.log('Validation failed. Profile update prevented.');
    }
  };

  // --- 4. RESET HANDLER ---
  const handleReset = () => {
    // Reloads the component state with the initial mock data
    setFullName(res.fullName);
    setEmail(res.email);
    setPhoneNumber(res.phoneNumber);
    setCity(res.city);
    setStateDistrict(res.district);
    setPincode(res.pincode);
    setLandmark(res.landmark);
    if(res.accountHolderName!=undefined || res.accountHolderName!=null)
      setAccountHolderName(res.accountHolderName);
    if(res.ifscCode!=undefined || res.ifscCode!=null)
      setIfscCode(res.ifscCode);
    if(res.bankAccountNumber!=undefined || res.bankAccountNumber!=null)
      setAccountNumber(res.bankAccountNumber);
    setErrors({});
    alert('Form reset to saved values.');
  };
  const handleLogout = () => {
        navigate('/login');
    };
  if (isLoading) {
    return (
        <div className="profile-edit-page loading-state">
            <h1 className="sidebar-logo">SmartMandi</h1>
            <p className="loading-text">Loading profile details...</p>
        </div>
    );
  }

  return (
    <div className="profile-edit-page">
      {/* Sidebar - Reusing styles from previous components */}
      <aside className="sidebar-nav">
        <h1 className="sidebar-logo">SmartMandi</h1>
        <nav className="nav-menu">
            <a href="/farmer/dashboard" className="nav-item">
                <FontAwesomeIcon icon={faTachometerAlt} style={{marginRight: '10px'}} /> Dashboard
            </a>
            <a href="/farmer/analytics" className="nav-item">
                <FontAwesomeIcon icon={faChartLine} style={{marginRight: '10px'}} /> Analytics
            </a>
            <a href="/farmer/orders" className="nav-item active">
                <FontAwesomeIcon icon={faShoppingBasket} style={{marginRight: '10px'}} /> Sales Orders
            </a>
            <a href="/farmer/edit-profile" className="nav-item">
                <FontAwesomeIcon icon={faCog} style={{marginRight: '10px'}} /> Settings
            </a>
            <a href="#" onClick={handleLogout} className="nav-item logout-link">
                <FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: '10px'}} /> Logout
            </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="profile-form-main">
        <div className="form-header">
            <h2>Edit Profile & Address</h2>
            <p className="form-subtitle">
                Update your contact and primary location details.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          
          {/* --- 1. Personal & Contact Details --- */}
          <div className="form-section">
            <h3 className="section-title"><i className="fas fa-user"></i> Personal & Contact Details</h3>
            
            <div className="input-group full-width">
              <label htmlFor="fullName">Full Name *</label>
              <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className={errors.fullName ? 'input-error' : ''} />
              {errors.fullName && <p className="error-message">{errors.fullName}</p>}
            </div>

            <div className="input-row">
                <div className="input-group half-width">
                    <label htmlFor="email">Email Address *</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'input-error' : ''} />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                </div>
                <div className="input-group half-width">
                    <label htmlFor="phoneNumber">Phone Number *</label>
                    <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 1234567890" className={errors.phoneNumber ? 'input-error' : ''} />
                    {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                </div>
            </div>
          </div>
          
          {/* --- 2. Primary Address --- */}
          <div className="form-section">
            <h3 className="section-title"><i className="fas fa-map-marker-alt"></i> Primary Address</h3>

            <div className="input-row">
              <div className="input-group half-width">
                <label htmlFor="city">City *</label>
                <input type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dharwad" className={errors.city ? 'input-error' : ''} />
                {errors.city && <p className="error-message">{errors.city}</p>}
              </div>

              <div className="input-group half-width">
                <label htmlFor="stateDistrict">State/District *</label>
                <input type="text" id="stateDistrict" value={stateDistrict} onChange={(e) => setStateDistrict(e.target.value)} placeholder="Karnataka" className={errors.stateDistrict ? 'input-error' : ''} />
                {errors.stateDistrict && <p className="error-message">{errors.stateDistrict}</p>}
              </div>
            </div>

            <div className="input-row">
                <div className="input-group half-width">
                    <label htmlFor="pincode">Pincode *</label>
                    <input type="text" id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="580001" className={errors.pincode ? 'input-error' : ''} />
                    {errors.pincode && <p className="error-message">{errors.pincode}</p>}
                </div>
                <div className="input-group half-width">
                    <label htmlFor="landmark">Landmark (Optional)</label>
                    <input type="text" id="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Near bus stop / IT" />
                </div>
            </div>
          </div>
          
          {/* --- 3. Banking Information --- */}
          <div className="form-section">
            <h3 className="section-title"><i className="fas fa-university"></i> Banking Information (Mandatory for Payouts)</h3>
            
            <blockquote className="banking-note">
                <i className="fas fa-info-circle"></i> This information is strictly confidential and **required** to receive payments from SmartMandi for your sales.
            </blockquote>

            <div className="input-group full-width">
              <label htmlFor="accountHolderName">Account Holder Name *</label>
              <input type="text" id="accountHolderName" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className={errors.accountHolderName ? 'input-error' : ''} />
              {errors.accountHolderName && <p className="error-message">{errors.accountHolderName}</p>}
            </div>

            <div className="input-row">
                <div className="input-group half-width">
                    <label htmlFor="ifscCode">IFSC Code *</label>
                    <input type="text" id="ifscCode" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} placeholder="SBIN0000000" className={errors.ifscCode ? 'input-error' : ''} />
                    {errors.ifscCode && <p className="error-message">{errors.ifscCode}</p>}
                </div>
                <div className="input-group half-width">
                    <label htmlFor="accountNumber">Account Number *</label>
                    <input type="text" id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="1234567890123" className={errors.accountNumber ? 'input-error' : ''} />
                    {errors.accountNumber && <p className="error-message">{errors.accountNumber}</p>}
                </div>
            </div>
          </div>

          {/* --- SUBMISSION ACTIONS --- */}
          <div className="form-actions">
            <button type="submit" className="submit-button update-button">
              <i className="fas fa-save"></i> Save Profile Changes
            </button>
            <button type="button" onClick={handleReset} className="cancel-button">
              Reset Form
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default FarmerEditProfile;