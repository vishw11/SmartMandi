import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import "./Register.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- important!
const Register = () => {
    const navigate = useNavigate();
    const [registered,setRegister]=useState()
    const [formData, setFormData] = useState({
        accountType: 'farmer',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        district: '',
        pincode: '',
        landmark: '',
        phoneNumber: '',
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        
        if (!formData.fullName) newErrors.fullName = "Full Name is required.";
        if (!formData.email) newErrors.email = "Email Address is required.";
        if (!formData.password) newErrors.password = "Password is required.";
        if (formData.password.length < 8) newErrors.password = "Password must be 8+ characters.";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
        if (!formData.city) newErrors.city = "City is required.";
        if (!formData.district) newErrors.district = "District is required.";
        if (!formData.pincode) newErrors.pincode = "Pincode is required.";
        if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required.";
        if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the Terms and Conditions.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        
        
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleSubmit = (e) => {
        console.log("account type",formData.accountType);
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fix the errors", { position: "top-right" })
            return;
        }

        axios.post("http://localhost:5000/smartmandi/register",{
            "role": formData.accountType,
            "fullName": formData.fullName,
            "email": formData.email,
            "password": formData.password,
            "phoneNumber": formData.phoneNumber,
            "city": formData.city,
            "district": formData.district,
            "pincode": formData.pincode,
            "landmark": formData.landmark
        })
        .then(setRegister(true,
            //()=>{
            toast.success("You have registered successfully!", { position: "top-right" })
            
        //})
    ))
    };
    if(registered){
        navigate(`/login/${formData.accountType.toLowerCase()}`);
    }
    return (
        <div className="register-container">
            <h1 className="logo">SmartMandi</h1>
            <h2 className="title">Register Your Account</h2>
            
            <form className="form" onSubmit={handleSubmit}>
                <fieldset className="account-type-fieldset">
                    <legend className="label">Account Type *</legend>
                    <label>
                        <input type="radio" name="accountType" value="farmer" checked={formData.accountType === 'farmer'} onChange={handleChange} /> Farmer
                    </label>
                    <label>
                        <input type="radio" name="accountType" value="vendor" checked={formData.accountType === 'vendor'} onChange={handleChange} /> Vendor
                    </label>
                </fieldset>

                <label className="label">Full Name *</label>
                <input type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'input-error' : ''} />
                {errors.fullName && <p className="error-text">{errors.fullName}</p>}

                <label className="label">Email Address *</label>
                <input type="email" name="email" placeholder="e.g., user@smartmandi.com" value={formData.email} onChange={handleChange} className={errors.email ? 'input-error' : ''} />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <label className="label">Password *</label>
                <input type="password" name="password" placeholder="Must be 8+ characters" value={formData.password} onChange={handleChange} className={errors.password ? 'input-error' : ''} />
                {errors.password && <p className="error-text">{errors.password}</p>}

                <label className="label">Confirm Password *</label>
                <input type="password" name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'input-error' : ''} />
                {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

                <h3 className="subtitle">Address Details</h3>
                
                <div className="input-row">
                    <div className="input-group">
                        <label className="label">City *</label>
                        <input type="text" name="city" placeholder="e.g., Pune" value={formData.city} onChange={handleChange} className={errors.city ? 'input-error' : ''} />
                        {errors.city && <p className="error-text">{errors.city}</p>}
                    </div>
                    <div className="input-group">
                        <label className="label">District *</label>
                        <input type="text" name="district" placeholder="e.g., Pune District" value={formData.district} onChange={handleChange} className={errors.district ? 'input-error' : ''} />
                        {errors.district && <p className="error-text">{errors.district}</p>}
                    </div>
                </div>

                <label className="label">Pincode *</label>
                <input type="text" name="pincode" placeholder="e.g., 411001" value={formData.pincode} onChange={handleChange} className={errors.pincode ? 'input-error' : ''} />
                {errors.pincode && <p className="error-text">{errors.pincode}</p>}

                <label className="label">Landmark (Optional)</label>
                <input type="text" name="landmark" placeholder="e.g., Near City Mall" value={formData.landmark} onChange={handleChange} />

                <label className="label">Phone Number *</label>
                <input type="tel" name="phoneNumber" placeholder="e.g., +91-9876543210" value={formData.phoneNumber} onChange={handleChange} className={errors.phoneNumber ? 'input-error' : ''} />
                {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}

                <div className="terms-checkbox-group">
                    <input type="checkbox" id="agreedToTerms" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} />
                    <label htmlFor="agreedToTerms">I agree to the Terms and Conditions *</label>
                </div>
                {errors.agreedToTerms && <p className="error-text">{errors.agreedToTerms}</p>}
                
                <button type="submit" className="register-button">Register Account</button>
            </form>
            <ToastContainer/>
        </div>
    );
};

export default Register;
