import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./BrowseProducts.css";
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, faExclamationTriangle, faTruck, faCheckCircle, 
    faShoppingBasket, faTachometerAlt, faLeaf, faCog, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';
import tomato from "../../assets/tomato.jpg";

// --- DUMMY DATA ---
const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'grains', label: 'Grains' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
];

// --- Sub-Component: Product Listing Card ---
const ProductListingCard = ({ product, onClick }) => {
  const date = new Date();
  const navigate = useNavigate();

  const { 
    _id, ProductName, Description, PricePerUnit, UnitType, Status, createdAt, images,QuantityAvailable
  } = product;
  const {fullName,city,district}= product.FarmerID
  const FarmerID = product.FarmerID._id
  const days = Math.round((date - new Date(createdAt)) / (24 * 3600 * 1000) + 1);

  const getStatusClass = (status) => {
    if (QuantityAvailable <= product.MinimumOrderQuantity) return 'status-limited';
    return 'status-available';
  };

  const handleAddToOrder = () => {
    navigate(`/vendor/productDetails`,{state:product})
  };

  return (
    <div className="product-listing-card" onClick={onClick}>  {/* ✅ make the whole card clickable */}
      <img 
        src={images && images[0] ? images[0] : tomato} 
        alt={ProductName} 
        className="listing-image" 
      />
      
      <span className={`status-tag ${getStatusClass(Status)}`}>
        {Status}
      </span>

      <div className="listing-details">
        <h4 className="listing-name">{ProductName}</h4>
        <p className="listing-description">{Description}</p>

        <div className="listing-info-row">
          <p><i className="fas fa-user-circle"></i> Farmer ID: {FarmerID}</p>
          <p><i className="fas fa-box-open"></i> Listed {days} days ago</p>
          <p><i className="fas fa-box-open"></i>Available {QuantityAvailable} quantities</p>
        </div>

        <div className="listing-price-row">
          <span className="listing-price">
            ₹ {PricePerUnit} / {UnitType}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // ✅ prevent triggering card click
              handleAddToOrder();
            }} 
            className="add-to-order-button"
          >
            <i className="fas fa-cart-plus"></i> Add to Order
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN BROWSE PRODUCTS COMPONENT ---
function BrowseProducts() {
    const navigate = useNavigate();
    
    // --- State for Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceSort, setPriceSort] = useState('low-to-high');
    const [displayProducts, setDisplayProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);

    // --- Fetch All Products ---
    useEffect(() => {
        axios.get("http://localhost:5000/smartmandi/product/getAllProducts")
            .then(response => {
                console.log(response);
                setDisplayProducts(response.data);
                setAllProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    // --- Filter Application Logic ---
    const applyFilters = () => {
        if (!allProducts || allProducts.length === 0) return;
        let filtered = [...allProducts];

        // 1. Filter by Search Term (Name or Farmer ID)
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.ProductName.toLowerCase().includes(lowerCaseSearch) ||
                p.FarmerID.toString().toLowerCase().includes(lowerCaseSearch)
            );
        }

        // 2. Filter by Category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => 
                p.Category && p.Category.toLowerCase() === selectedCategory
            );
        }

        // 3. Sort by Price
        filtered.sort((a, b) => {
            if (priceSort === 'low-to-high') {
                return a.PricePerUnit - b.PricePerUnit;
            } else if (priceSort === 'high-to-low') {
                return b.PricePerUnit - a.PricePerUnit;
            }
            return 0;
        });

        setDisplayProducts(filtered);
    };

    // ✅ Auto-apply filters when search/category/sort changes
    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedCategory, priceSort]);

    // Reset filters and display all products
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setPriceSort('low-to-high');
        setDisplayProducts(allProducts);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    const viewProductDetails = (product) => {
        navigate(`/vendor/productDetails`,{state:product})
    };

    return (
        <div className="browse-products-container">
            {/* --- SIDEBAR --- */}
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
            <main className="browse-main-content">
                <div className="form-header">
                    <h2>Browse Available Produce</h2>
                    <p className="form-subtitle">
                        Search and filter high-quality produce listed by our verified farmers.
                    </p>
                </div>

                {/* --- FILTER BAR --- */}
                <section className="filter-bar">
                    <div className="search-input-group">
                        <i className="fas fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search products by name or farmer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>

                    <select 
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                    >
                        <option value="low-to-high">Price: Low to High</option>
                        <option value="high-to-low">Price: High to Low</option>
                    </select>

                    <button onClick={applyFilters} className="apply-filters-button">
                        Apply Filters
                    </button>
                    
                    <button onClick={resetFilters} className="reset-filters-button" title="Reset Filters">
                        <i className="fas fa-undo"></i>
                    </button>
                </section>

                {/* --- PRODUCT LISTINGS --- */}
                <section className="product-listings-grid">
                    {displayProducts && displayProducts.length > 0 ? (
                        displayProducts.map(product => (
                            <ProductListingCard 
                                key={product._id} 
                                product={product} 
                                onClick={() => {viewProductDetails(product)}}
                            />
                        ))
                    ) : (
                        <div className="no-results-message">
                            <i className="fas fa-box-open"></i>
                            <p>No products match your current filters. Try broadening your search!</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default BrowseProducts;
