import React, { useState, useEffect,useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./ProductDetails.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faExclamationTriangle, faTruck, faCheckCircle, faShoppingBasket, faTachometerAlt, faLeaf, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// --- MOCK PRODUCT DATA (Simulated Fetch) ---
const mockProduct = {
    id: 'prod_wheat_456',
    name: 'Premium Wheat',
    reviews: 120,
    rating: 4.8,
    basePrice: 2200, // Price per Quintal
    unit: 'Quintal (100 kg)',
    inventory: 500,
    minOrderQuantity: 10,
    description: "High-protein milling wheat, Grade A, sourced from the fertile lands of Rajasthan. Our Durum wheat is machine-cleaned, triple-filtered, and moisture-tested to ensure suitability for large-scale flour production. Guaranteed minimum protein content of **13.5%**.",
    
    // Supplier Info
    supplier: {
        id: 'FMB101',
        name: 'Vishesh Farms (FMB101)',
        location: 'Ahmedabad, Gujarat',
        productsListed: 15,
    },
    
    // Image Gallery
    images: [
        { id: 1, url: 'wheat_main.png' },
        { id: 2, url: 'wheat_thumb_a.png' },
        { id: 3, url: 'wheat_thumb_b.png' },
    ],
};

function ProductDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    console.log(location)
    // --- State Hooks ---
    const [product, setProduct] = useState(location.state);
    const [orderQuantity, setOrderQuantity] = useState(''); // Quantity in Quintals
    const [quantityError, setQuantityError] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Dynamic Calculations ---
    const estimatedCost = useMemo(() => {
        const qty = parseFloat(orderQuantity);
        if (qty && qty > 0 && product) {
            return qty * product.PricePerUnit;
        }
        return 0;
    }, [orderQuantity, product]);

    // --- Input Validation & Handling ---
    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setOrderQuantity(value);
        
        const qty = parseFloat(value);
        setQuantityError('');

        if (qty < product.MinimumOrderQuantity) {
            setQuantityError(`Minimum Order Quantity (MOQ) is ${product.MinimumOrderQuantity+" "+location.state.UnitType}`);
        } else if (qty > product.QuantityAvailable) {
            setQuantityError(`Only ${product.QuantityAvailable+" "+location.state.UnitType} available for dispatch.`);
        } else if (isNaN(qty) || qty <= 0) {
             setQuantityError(`Please enter a valid quantity.`);
        }
    };
    
    // --- Action Handlers ---
    const handleAddToOrder = () => {
        if (quantityError || !orderQuantity || parseFloat(orderQuantity) < product.MinimumOrderQuantity) {
            alert('Please fix quantity errors before adding to order.');
            return;
        }
        const date = new Date();
        const order = {
            
                "vendorId": localStorage.getItem("id"),
                "farmerId": product.FarmerID,
                "productId":product._id,
                "quantity":orderQuantity,
                "deliveryAddress": "..",
                "deliveryDate": date,
                "totalAmount": orderQuantity * product.PricePerUnit,
                "orderStatus": "Accepted",
                "paymentStatus": "Pending"
            
        }
        try{
            axios.post("http://localhost:5000/smartmandi/order/createOrder",order).then(()=>{
                alert(`Successfully added ${orderQuantity} ${product.UnitType} to your order basket!`);
                navigate("/vendor/orders")
            })
        }catch{
            alert(`Error in placing order`);
        }
        
        // navigate('/my-orders'); // or some cart view
    };
    
    const handleContactSupplier = () => {
        alert(`Initiating contact with ${product.supplier.name}.`);
        // navigate('/messages/FMB101'); // In a real app, opens a chat modal/page
    };
    
    const handleBackToBrowsing = () => {
        navigate('/vendor/browseProducts');
    };
    const handleLogout = () => {
        navigate('/login');
    };
    
    if (isLoading || !product) {
        return (
            <div className="product-details-page loading-state">
                <h1 className="sidebar-logo">SmartMandi</h1>
                <p className="loading-text">Loading product details...</p>
            </div>
        );
    }
    useEffect(()=>{
        setMainImage(product.images[0])
    },[])
    return (
        <div className="product-details-page">
            {/* --- SIDEBAR --- (Reused) */}
            <aside className="sidebar-nav">
                <h1 className="sidebar-logo">SmartMandi</h1>
                <p className="vendor-portal-text">Vendor Portal</p>
                <nav className="nav-menu">
                  <a href="/vendor/dashboard" className="nav-item">
                    <FontAwesomeIcon icon={faTachometerAlt} style={{marginRight: '10px'}} /> Dashboard
                    </a>
                    <a href="/vendor/browseProducts" className="nav-item active">
                        <FontAwesomeIcon icon={faLeaf} style={{marginRight: '10px'}} /> Browse Products
                    </a>
                    <a href="/vendor/orders" className="nav-item">
                        <FontAwesomeIcon icon={faShoppingBasket} style={{marginRight: '10px'}} /> My Orders
                    </a>
                    <a href="/vendor/editProfile" className="nav-item">
                        <FontAwesomeIcon icon={faCog} style={{marginRight: '10px'}} /> Settings
                    </a>
                    <a href="#" onClick={handleLogout} className="nav-item logout-link">
                        <FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: '10px'}} /> Logout
                    </a>
                </nav>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="product-main-content">
                <header className="product-header">
                    <h2>Product Details</h2>
                    <p className="product-subtitle">
                        Review quality, inventory, and pricing before placing an order.
                    </p>
                    <button onClick={handleBackToBrowsing} className="back-button">
                         &larr; Back to Browsing
                    </button>
                </header>

                {/* --- PRODUCT LAYOUT (Image + Info) --- */}
                <section className="product-layout">
                    
                    {/* LEFT COLUMN: Images & Description */}
                    <div className="product-visuals-col">
                        <div className="main-image-container">
                             {/*  */}
                            <img src={mainImage} alt={location.state.ProductName} className="main-image" />
                        </div>
                        <div className="thumbnail-gallery">
                            {product.images.map(img => (
                                <img 
                                    key={img.id}
                                    src={img}
                                    alt={`Thumbnail ${img.id}`}
                                    className={`thumbnail ${img.url === mainImage ? 'active' : ''}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                            <div className="thumbnail placeholder-thumb">
                                <i className="fas fa-plus"></i>
                            </div>
                        </div>
                        
                        {/* Product Description */}
                        <div className="product-description-box">
                            <h3 className="section-title">Product Description</h3>
                            <p dangerouslySetInnerHTML={{ __html: product.Description.replace(/\*\*/g, '<strong>') }}></p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Info & Actions */}
                    <div className="product-info-col">
                        
                        {/* Title & Pricing */}
                        <div className="info-section">
                            <h1 className="product-name-title">{location.state.ProductName}</h1>
                            <p className="reviews-text">
                                <i className="fas fa-star rating-star"></i> {product.rating} ({product.reviews} reviews)
                            </p>
                            <span className="product-price-display">
                                ₹ {product.PricePerUnit.toLocaleString('en-IN')} / {location.state.UnitType}
                            </span>
                        </div>
                        
                        {/* Inventory Section */}
                        <div className="info-section inventory-section">
                            <h3 className="section-title"><i className="fas fa-warehouse"></i> Inventory</h3>
                            <p className="inventory-text">
                                **{location.state.QuantityAvailable+ " "+  location.state.UnitType}  available for immediate dispatch.
                            </p>
                            <p className="moq-text">
                                Minimum Order Quantity (MOQ): **{location.state.MinimumOrderQuantity+ " "+  location.state.UnitType}
                            </p>
                        </div>

                        {/* Order Placement Section */}
                        <div className="info-section order-section">
                            <h3 className="section-title">Place Your Order</h3>
                            <div className="order-input-row">
                                <div className="order-quantity-group">
                                    <label htmlFor="orderQuantity">Quantity in ({" "+ location.state.UnitType})</label>
                                    <input
                                        type="number"
                                        id="orderQuantity"
                                        value={orderQuantity}
                                        onChange={handleQuantityChange}
                                        className={quantityError ? 'input-error' : ''}
                                        min={product.minOrderQuantity}
                                    />
                                    {quantityError && <p className="error-message">{quantityError}</p>}
                                </div>
                                <div className="estimated-cost-group">
                                    <p className="estimated-cost-label">Estimated Cost:</p>
                                    <p className="estimated-cost-value">
                                        ₹ {estimatedCost.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="order-actions">
                                <button onClick={handleAddToOrder} className={`action-button add-to-basket ${quantityError ? 'disabled-button' : ''}`} disabled={!!quantityError}>
                                    <i className="fas fa-shopping-basket"></i> Add to Order Basket
                                </button>
                                <button onClick={handleContactSupplier} className="action-button contact-supplier">
                                    <i className="fas fa-phone-alt"></i> Contact Supplier
                                </button>
                            </div>
                        </div>

                        {/* Supplier Information Section */}
                        <div className="info-section supplier-section">
                            <h3 className="section-title"><i className="fas fa-handshake"></i> Supplied By</h3>
                            <p className="supplier-name">{location.state.FarmerID.fullName}</p>
                            <p className="supplier-location">Location: {location.state.FarmerID.district + "," + location.state.FarmerID.city}</p>
                            <button onClick={() => alert('Viewing profile...')} className="view-profile-link">
                                View Supplier Profile
                            </button>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}

export default ProductDetails;