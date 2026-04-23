import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; // <-- 1. Import axios for API calls
import "./EditProduct.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- important!
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faChartLine, faShoppingBasket, faCog, faSignOutAlt,
    faUser, faMapMarkerAlt, faShippingFast, faCheckCircle, faTimesCircle,
    faExclamationTriangle, faMoneyBillWave, faTruck
} from '@fortawesome/free-solid-svg-icons';

// --- CLOUDINARY CONFIGURATION (⚠️ Use Unsigned Preset - API Secret must NOT be here) ---
const CLOUDINARY_CLOUD_NAME = 'dmiji7qox';
// 2. >>> REPLACE 'smartmandi_preset' with the name of your Unsigned Upload Preset <<<
const CLOUDINARY_UPLOAD_PRESET = 'smartmandi'; 
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


// --- DUMMY DATA (for Select dropdowns) ---
const categories = [
  { value: '', label: 'Select a primary category' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'grains', label: 'Grains' },
  { value: 'dairy', label: 'Dairy' },
];
const unitTypes = ['Kilograms (Kg)', 'Units', 'Litres (L)', 'Dozens'];

// --- DUMMY INITIAL PRODUCT DATA (Simulated API Fetch) ---


function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams(); // Use this to get the ID from the URL (e.g., /edit/prod123)
  const location = useLocation();
  
  // --- FORM STATE HOOKS ---
  const [productName, setProductName] = useState(location.state.ProductName);
  const [category, setCategory] = useState(location.state.Category);
  const [description, setDescription] = useState(location.state.Description);
  const [quantityAvailable, setQuantityAvailable] = useState(location.state.QuantityAvailable);
  const [unitType, setUnitType] = useState(location.state.UnitType);
  const [pricePerUnit, setPricePerUnit] = useState(location.state.PricePerUnit);
  const [minOrderQuantity, setMinOrderQuantity] = useState(location.state.MinimumOrderQuantity);
  const [imageUrls, setImageUrls] = useState(location.state.images); 
  const [isUploading, setIsUploading] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  
  // --- ERROR STATE HOOKS ---
  const [errors, setErrors] = useState({});

  // --- 1. DATA FETCHING (Simulated) ---
  // useEffect(() => {
  //   // In a real app: axios.get(`/api/products/${productId}`).then(response => setInitialData(response.data));
    
  //   // Simulate API fetch delay
  //   setTimeout(() => {
  //       setProductName(mockProductData.productName);
  //       setCategory(mockProductData.category);
  //       setDescription(mockProductData.description);
  //       setQuantityAvailable(mockProductData.quantityAvailable);
  //       setUnitType(mockProductData.unitType);
  //       setPricePerUnit(mockProductData.pricePerUnit);
  //       setMinOrderQuantity(mockProductData.minOrderQuantity);
  //       setImageUrls(mockProductData.imageUrls);
  //       setIsLoading(false);
  //   }, 500);
  // }, [productId]); // Depend on productId if using useParams

  // --- 2. CLOUDINARY UPLOAD HANDLER (REAL) ---
  const uploadToCloudinary = async (file) => {
    // Client-side file size check
    if (file.size > 5 * 1024 * 1024) { // 5MB limit check
        throw new Error(`File ${file.name} is too large (max 5MB).`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET); 
    formData.append('folder', 'smartmandi_products'); 

    console.log(`Uploading file: ${file.name} to Cloudinary...`);

    try {
        const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        // Cloudinary returns the uploaded image URL in response.data.secure_url
        return response.data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error.response ? error.response.data : error.message);
        throw new Error(`Cloudinary upload failed for ${file.name}.`);
    }
  };

  // --- 3. IMAGE UPLOAD CHANGE HANDLER ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = imageUrls.length + files.length;

    if (totalFiles > 4) {
      alert(`You can only upload a maximum of 4 images. You selected ${files.length} but already have ${imageUrls.length}.`);
      e.target.value = null; 
      return;
    }

    if (files.length === 0) return;

    setIsUploading(true);
    setErrors(prev => ({ ...prev, imageUrls: '' }));

    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const newUrls = await Promise.all(uploadPromises);
      // New URLs are merged with existing URLs
      setImageUrls(prevUrls => [...prevUrls, ...newUrls]);

    } catch (error) {
        alert(`Error uploading file: ${error.message}`);
        setErrors(prev => ({ ...prev, imageUrls: error.message }));
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  // --- 4. Image Removal (Updated to suggest backend cleanup) ---
  const removeImage = (indexToRemove) => {
    const urlToRemove = imageUrls[indexToRemove];

    // 1. Update the local state (UI change)
    setImageUrls(prevUrls => 
      prevUrls.filter((_, index) => index !== indexToRemove)
    );

    // ⚠️ IMPORTANT: In a real app, you would call a backend function here
    // to securely delete 'urlToRemove' from Cloudinary to free up storage.
    console.warn(`Simulating request to backend: Please delete the image with URL: ${urlToRemove} from Cloudinary.`);
  };
  
  // --- 5. VALIDATION LOGIC (Same as before) ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!productName.trim()) { newErrors.productName = 'Product name is required.'; isValid = false; }
    if (!category) { newErrors.category = 'Please select a primary category.'; isValid = false; }
    if (!description.trim() || description.trim().length < 20) { newErrors.description = 'Description must be at least 20 characters.'; isValid = false; }

    const qa = parseFloat(quantityAvailable);
    const ppu = parseFloat(pricePerUnit);
    const moq = parseInt(minOrderQuantity);

    if (isNaN(qa) || qa <= 0) { newErrors.quantityAvailable = 'Must be a positive number.'; isValid = false; }
    if (isNaN(ppu) || ppu <= 0) { newErrors.pricePerUnit = 'Price must be greater than zero.'; isValid = false; }
    if (isNaN(moq) || moq < 1) { newErrors.minOrderQuantity = 'Minimum order must be at least 1 unit.'; isValid = false; }

    if (imageUrls.length < 1) { newErrors.imageUrls = 'Please upload at least one image.'; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  
  const handleSubmit = async (e) => { 
    e.preventDefault();

    if (validateForm()) {
      const updatedProductData = {
        //"_id": location.state._id,
        "ProductName":productName,
        "Category":category,
        "Description":description,
        "QuantityAvailable": parseFloat(quantityAvailable),
        "UnitType":unitType,
        "PricePerUnit": parseFloat(pricePerUnit),
        "MinimumOrderQuantity": parseInt(minOrderQuantity),
        "images":imageUrls,
        "Status":(parseFloat(quantityAvailable)>=parseInt(minOrderQuantity)?"Available":"Low Stock")
      };
      
      try {
          const response = await axios.put(`http://localhost:5000/smartmandi/product/update/${location.state._id}`, updatedProductData); 
          
          if (response.status === 200) { 
              toast.success("✅ Product deleted successfully!", { position: "top-right" });
              setTimeout(()=>{
                navigate('/farmer/dashboard'); 
              },1000) 
              
          }
      } catch (apiError) {
          console.error('Backend API Error:', apiError);
      }
      
    } else {
      console.log('Validation failed. Update prevented.');
    }
  };

  // --- 7. CANCEL / DISCARD HANDLER ---
  const handleCancel = () => {
    const confirmDiscard = window.confirm('Are you sure you want to discard all changes?');
    if (confirmDiscard) {
      navigate('/farmer/dashboard'); // Go back without saving
    }
  };

  const handleLogout = () => {
        navigate('/login');
    };

  if (isLoading) {
    return (
        <div className="edit-product-page loading-state">
            <h1 className="sidebar-logo">SmartMandi</h1>
            <p className="loading-text">Loading product data...</p>
        </div>
    );
  }

  return (
    <div className="edit-product-page">
      {/* Sidebar - Replicate the look from the Dashboard */}
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
      <main className="product-form-main">
        <div className="form-header">
            <h2>Edit Product ✏️</h2>
            <p className="form-subtitle">
                Update the details for your existing product on SmartMandi.
            </p>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          
          {/* --- 1. Basic Product Information --- */}
          <div className="form-section">
            <h3 className="section-title">Basic Product Information</h3>
            
            <div className="input-group full-width">
              <label htmlFor="productName">Product Name *</label>
              <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className={errors.productName ? 'input-error' : ''} />
              {errors.productName && <p className="error-message">{errors.productName}</p>}
            </div>

            <div className="input-row">
                <div className="input-group half-width">
                    <label htmlFor="category">Category *</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={errors.category ? 'input-error' : ''}>
                        {categories.map((cat) => (
                            <option key={cat.value} value={cat.value} disabled={cat.value === ''}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && <p className="error-message">{errors.category}</p>}
                </div>
            </div>

            <div className="input-group full-width">
              <label htmlFor="description">Product Description</label>
              <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className={errors.description ? 'input-error' : ''} ></textarea>
              {errors.description && <p className="error-message">{errors.description}</p>}
            </div>
          </div>
          
          {/* --- 2. Pricing and Inventory --- */}
          <div className="form-section">
            <h3 className="section-title">Pricing and Inventory</h3>

            <div className="input-row">
              <div className="input-group half-width">
                <label htmlFor="quantityAvailable">Quantity Available *</label>
                <input type="number" id="quantityAvailable" value={quantityAvailable} onChange={(e) => setQuantityAvailable(e.target.value)} className={errors.quantityAvailable ? 'input-error' : ''} />
                {errors.quantityAvailable && <p className="error-message">{errors.quantityAvailable}</p>}
              </div>

              <div className="input-group half-width">
                <label htmlFor="unitType">Unit Type *</label>
                <select id="unitType" value={unitType} onChange={(e) => setUnitType(e.target.value)}>
                  {unitTypes.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-row">
                <div className="input-group half-width">
                    <label htmlFor="pricePerUnit">Price per Unit (INR) *</label>
                    <input type="number" id="pricePerUnit" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} className={errors.pricePerUnit ? 'input-error' : ''} />
                    {errors.pricePerUnit && <p className="error-message">{errors.pricePerUnit}</p>}
                </div>
                <div className="input-group half-width">
                    <label htmlFor="minOrderQuantity">Minimum Order Quantity</label>
                    <input type="number" id="minOrderQuantity" value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(e.target.value)} className={errors.minOrderQuantity ? 'input-error' : ''} />
                    {errors.minOrderQuantity && <p className="error-message">{errors.minOrderQuantity}</p>}
                </div>
            </div>
          </div>
          
          {/* --- 3. Product Images --- */}
          <div className="form-section">
            <h3 className="section-title">Product Images *</h3>
            <p className="image-help-text">
                Upload at least one high-quality image of your product. (Max 4 images)
            </p>
            
            <label htmlFor="image-upload" className={`upload-button-label ${isUploading || imageUrls.length >= 4 ? 'disabled-upload' : ''}`} style={{ pointerEvents: (isUploading || imageUrls.length >= 4) ? 'none' : 'auto' }}>
                {isUploading ? 'Uploading...' : 'Upload Photos'}
                <i className="fas fa-cloud-upload-alt" style={{ marginLeft: '8px' }}></i>
            </label>
            <input type="file" id="image-upload" multiple accept="image/*" onChange={handleImageUpload} disabled={isUploading || imageUrls.length >= 4} style={{ display: 'none' }} />

            <div className="image-preview-container">
              {[...Array(4)].map((_, index) => (
                <div key={index} className={`image-placeholder ${errors.imageUrls && index === 0 ? 'image-error-border' : ''}`}>
                  {imageUrls[index] ? (
                    <div className="uploaded-image-simulated loaded-image">
                      {/* Using the URL for the preview */}
                      <img src={imageUrls[index]} alt={`Product Image ${index + 1}`} className="preview-image-actual" /> 
                      <p className="image-text-overlay">Image {index + 1} Loaded</p>
                      <button type="button" className="remove-image-button" onClick={() => removeImage(index)} title="Remove Image">
                         &times;
                      </button>
                    </div>
                  ) : (
                    <p>Image {index + 1}</p>
                  )}
                </div>
              ))}
            </div>
            {errors.imageUrls && <p className="error-message">{errors.imageUrls}</p>}
          </div>

          {/* --- SUBMISSION ACTIONS --- */}
          <div className="form-actions">
            <button type="submit" className="submit-button update-button">
              <i className="fas fa-save"></i> Update Product on SmartMandi
            </button>
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel / Discard Changes
            </button>
          </div>
        </form>
      </main>
      <ToastContainer/>
    </div>
  );
}

export default EditProduct;
