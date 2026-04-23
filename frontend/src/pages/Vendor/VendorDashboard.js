import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./VendorDashboard.css"
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faExclamationTriangle, faTruck, faCheckCircle, faShoppingBasket, faTachometerAlt, faLeaf, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

// --- DUMMY DATA ---

const mockMetrics = [
  { label: 'Total Orders', value: '1,247', iconClass: 'fas fa-shopping-basket', color: '#1E90FF' },
  { label: 'Total Spent', value: '45,890', iconClass: 'fas fa-rupee-sign', color: '#DC3545' },
  { label: 'Active Suppliers', value: '23', iconClass: 'fas fa-users', color: '#FFC107' },
  { label: 'Pending Orders', value: '8', iconClass: 'fas fa-bell', color: '#F8F9FA' },
];

const mockRecentOrders = [
  { id: '#1234', status: 'Delivered', amount: 156 },
  { id: '#1235', status: 'In Transit', amount: 289 },
  { id: '#1236', status: 'Processing', amount: 432 },
];

// --- Sub-Component: Product Card (Reused/Adapted) ---
const FeaturedProductCard = ({ product }) => {
    const navigate = useNavigate();  // 👈 Import from react-router-dom

    const handleProductClick = () => {
        navigate("/vendor/productDetails", { state: product });
    };

    return (
        <div className="featured-product-card">
            <img 
                src={product.images[0]} 
                alt={product.ProductName} 
                className="product-image" 
                onClick={handleProductClick} // 👈 Optional: navigate on image click too
                style={{ cursor: "pointer",objectFit:"contain !important" }}
            />
            <div className="product-details">
                <h4 className="product-name">{product.ProductName}</h4>
                <p className="product-description">{product.Description}</p>
                <div className="product-price-row">
                    <span className="product-price">₹ {product.PricePerUnit} / {product.UnitType}</span>
                    <button 
                        className="add-to-cart-button"
                        onClick={handleProductClick} // 👈 Navigate on button click
                    >
                        <FontAwesomeIcon icon={faShoppingBasket} />
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- Sub-Component: Search/Filter Modal (Placeholder) ---
const SearchModal = ({ isOpen, onClose, query }) => {
    if (!isOpen) return null;
    
    // Simulate finding suppliers based on query
    const results = query.length > 2 
        ? ['Ganga Farms (Tomato)', 'Vishnu Grains (Wheat)', 'Rajendra Orchards (Apple)'] 
        : [];

    return (
        <div className="search-modal-backdrop" onClick={onClose}>
            <div className="search-modal-content" onClick={e => e.stopPropagation()}>
                <h4>Supplier Search Results</h4>
                {query.length < 3 ? (
                    <p className="no-results">Start typing a product or supplier name...</p>
                ) : results.length > 0 ? (
                    <ul>
                        {results.map((res, index) => (
                            <li key={index} className="search-result-item">
                                {res}
                                <button className="contact-supplier-button">Contact</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-results">No suppliers found for "{query}".</p>
                )}
            </div>
        </div>
    );
};


// --- MAIN VENDOR DASHBOARD COMPONENT ---
function VendorDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mockProducts,setMockProducts]= useState([]);
  // Effect to manage modal visibility based on search query
  useEffect(() => {
    if (searchQuery.length >= 3) {
      setIsSearchModalOpen(true);
    } else {
      setIsSearchModalOpen(false);
    }
    const id = localStorage.getItem("id")
    axios.get(`http://localhost:5000/smartmandi/product/getFeaturedProducts/${id}`)
    //.then(response => mockProducts)
    .then(response => {
        console.log(response)
        setMockProducts(response.data.featuredProducts)})
    .catch(error =>{

    })
  }, [searchQuery]);
  
  // --- Handlers ---
  const handleNewOrder = () => {
    navigate('/vendor/browseProducts'); // Navigate to the product browsing page
  };

  const handleFindSuppliers = () => {
    // Manually focus the search bar and open the modal if not already open
    const searchInput = document.getElementById('supplier-search');
    if (searchInput) searchInput.focus();
    setIsSearchModalOpen(true);
  };
  
  const handleLogout = () => {
      // Logic for logging out
      navigate('/');
  }

  return (
    <div className="vendor-dashboard-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar-nav">
        <h1 className="sidebar-logo">SmartMandi</h1>
        <p className="vendor-portal-text">Vendor Portal</p>
        <nav className="nav-menu">
            <a href="/vendor/dashboard" className="nav-item active">
            <FontAwesomeIcon icon={faTachometerAlt} style={{marginRight: '10px'}} /> Dashboard
            </a>
            <a href="/vendor/browseProducts" className="nav-item">
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
      <main className="dashboard-main-content">
        
        {/* --- HEADER/TOPBAR --- */}
        <header className="dashboard-topbar">
            <div className="dashboard-title-group">
                <h2>Vendor Dashboard</h2>
                <p className="subtitle-text">Manage your agricultural product purchases</p>
            </div>
            
            <div className="topbar-right">
                <div className="user-profile">
                    <span className="user-initials">{localStorage.getItem("name")[0]}</span>
                    <span className="user-name">{localStorage.getItem("name")}</span>
                </div>
            </div>
        </header>

        {/* --- METRICS ROW --- */}
        {/*<section className="metrics-row">
          {mockMetrics.map((metric, index) => (
            <div key={index} className="metric-card-vendor">
              <span className="metric-value">{metric.value}</span>
              <p className="metric-label">{metric.label}</p>
              <div className={`metric-icon-vendor ${metric.color.replace('#', 'color-')}`}>
                <i className={metric.iconClass}></i>
              </div>
            </div>
          ))}
        </section>*/}

        {/* --- MAIN BODY LAYOUT --- */}
        <section className="dashboard-body">
            
            {/* --- LEFT COLUMN: PRODUCTS --- */}
            <div className="products-column">
                <div className="section-header">
                    <h3>Featured Products</h3>
                    <a href="#" className="view-all-link">View All</a>
                </div>
                <div className="featured-products-grid">
                    {mockProducts.map(product => (
                        <FeaturedProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* --- RIGHT COLUMN: ORDERS & QUICK ACTIONS --- */}
            <div className="sidebar-column">
                
                {/* Quick Actions Section */}
                <div className="quick-actions-section">
                    <h3>Quick Actions</h3>
                    <div className="quick-action-buttons">
                        <button onClick={handleNewOrder} className="quick-action-button new-order-button">
                            <i className="fas fa-plus"></i> New Order
                        </button>
                        <div className="search-bar-vendor-action">
                            <i className="fas fa-search search-icon-vendor"></i>
                            <input 
                                type="text"
                                id="supplier-search"
                                placeholder="Find Suppliers"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>

                {/* Recent Orders Section */}
                {/*<div className="recent-orders-section">
                    <h3>Recent Orders</h3>
                    <div className="recent-orders-list">
                        {mockRecentOrders.map(order => (
                            <div key={order.id} className="recent-order-item">
                                <div className="order-details-vendor">
                                    <p className="order-id">{order.id}</p>
                                    <span className={`order-status-vendor status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>{order.status}</span>
                                </div>
                                <span className="order-amount-vendor">₹ {order.amount}</span>
                            </div>
                        ))}
                        <div className="metric-card-vendor pending order-alert-box">
                             <p>8 Pending Orders</p>
                             <i className="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                </div>*/}
            </div>

        </section>
      </main>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => {
            setIsSearchModalOpen(false);
            if (searchQuery.length < 3) setSearchQuery(''); // Clear if closed without meaningful search
        }} 
        query={searchQuery} 
      />
    </div>
  );
}

export default VendorDashboard;