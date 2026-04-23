import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard.js';
import "./FarmerDashboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- important!

let queryProducts = [];

const recentBuyers = [
  { name: 'Shreedatta Market', time: '2 mins ago' },
  { name: 'Vishnu Grocery', time: '5 hours ago' },
];

const recentOrders = [
  { store: 'Dharwad Grocery Store', details: 'Ordered 50Kg Organic Tomatoes', amount: '750.00', status: 'Processing' },
  { store: 'Fresh Market', details: 'Ordered 30Kg Carrots', amount: '1800.00', status: 'Delivered' },
];

const SearchModal = ({ isOpen, onClose, query }) => {
  if (!isOpen) return null;
  const filteredResults = queryProducts.filter(p => 
    p.ProductName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <h4>Search Results for "{query}"</h4>
        {query.length < 2 ? (
          <p className="no-results">Type at least 2 characters to search.</p>
        ) : filteredResults.length > 0 ? (
          <ul>
            {filteredResults.map(p => (
              <li key={p._id} className="search-result-item">
                {p.ProductName} - ₹{p.PricePerUnit}/{p.UnitType}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-results">No products found matching your query.</p>
        )}
      </div>
    </div>
  );
};

function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // for category filter
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTab, setActiveTab] = useState('My Product Listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [rating,setRating] = useState(0)
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('User logged out.');
    navigate('/login');
  };

  const handleAddProduct = () => {
    navigate('/farmer/add-product');
  };

  // --- DELETE PRODUCT HANDLER ---
  const handleDeleteProduct = async (product) => {
    try {
      axios.delete(`http://localhost:5000/smartmandi/product/delete/${product._id}`).then(
        () => {
          const productsAfterDeleting = products.filter(p => p._id !== product._id);
          setProducts(productsAfterDeleting);
          const filteredProductsAfterDeleting = filteredProducts.filter(p => p._id !== product._id);
          setFilteredProducts(filteredProductsAfterDeleting);

          toast.success("✅ Product deleted successfully!", { position: "top-right" });
        }
      );
    } catch (error) {
      toast.error("❌ Failed to delete product.", { position: "top-right" });
    }
  };

  // --- CATEGORY FILTER HANDLER ---
  const handleCategoryClick = (categoryName) => {
    if(categoryName.toLowerCase()=="all"){
      setFilteredProducts(products)
      return;
    }
    if (activeCategory === categoryName) {
      setActiveCategory('');
      setFilteredProducts(products);
    } else {
      setActiveCategory(categoryName);
      const filtered = products.filter(
        (p) => p.Category?.toLowerCase() === categoryName.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  };

  // --- DATA FETCH ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await axios.get(`http://localhost:5000/smartmandi/product/ProductListing/${id}`);
        setProducts(response.data.fetched);
        setFilteredProducts(response.data.fetched);
      } catch (apiError) {
        toast.error("No products listed");
      }
    };
    fetchProducts();
    const fetchRating = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await axios.get(`http://localhost:5000/smartmandi/getFarmerRating/${id}`);
        setRating(Math.round(response.data.farmerRating * 10)/10);
      } catch (apiError) {
        console.log(apiError)
        toast.error("No Rating available");
      }
    };
    fetchRating();
  }, []);

  // --- SEARCH MODAL CONTROL ---
  useEffect(() => {
    if (searchQuery.length > 1) setIsSearchModalOpen(true);
    else setIsSearchModalOpen(false);
  }, [searchQuery]);

  queryProducts = products;

  // --- CATEGORY COUNT DYNAMICALLY ---
  const categoryCounts = () => {
    const counts = {};
    products.forEach(product => {
      const category = product.Category?.toLowerCase();
      if (category) {
        counts[category] = (counts[category] || 0) + 1;
      }
    });

    return counts;
  };

  const categories = [
    { name: 'All',count:products.length || 0},
    { name: 'Vegetables', count: categoryCounts()['vegetables'] || 0 },
    { name: 'Fruits', count: categoryCounts()['fruits'] || 0 },
    { name: 'Grains', count: categoryCounts()['grains'] || 0 },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="header-logo">SmartMandi</h1>
        <nav className="header-nav">
          <a href="/farmer/dashboard" className="nav-link">Dashboard</a>
          <a href="/farmer/orders" className="nav-link">Orders</a>
          <a href="#" className="nav-link">Analytics</a>
          <a href="/farmer/edit-profile" className="nav-link">Edit Profile</a>
        </nav>
        
        <div className="header-actions">
          {/*<div className="search-box-container">
            <FontAwesomeIcon icon={faSearch}/>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>*/}
          
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
          
          <div className="user-profile">
            <span className="user-initials">{rating>0?rating:"NR"}</span>
            <span className="user-name">{localStorage.getItem("name")}</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <aside className="dashboard-sidebar">
          <div className="metric-cards">
            <div className="metric-card active">
              <span className="metric-label">Active Listings</span>
              <span className="metric-value">{products.length}</span>
            </div>
            {/*<div className="metric-card pending">
              <span className="metric-label">Pending Orders</span>
              <span className="metric-value">8</span>
            </div>*/}
          </div>

          <div className="sidebar-section categories-section">
            <h4>Categories</h4>
            {categories.map((cat, index) => (
              <div 
                key={index} 
                className={`category-item ${activeCategory === cat.name ? 'active-category' : ''}`}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <p>{cat.name} ({cat.count})</p>
              </div>
            ))}
          </div>
          {/*}
          <div className="sidebar-section recent-buyers-section">
            <h4>Recent Buyers</h4>
            {recentBuyers.map((buyer, index) => (
              <div key={index} className="buyer-item">
                <p className="buyer-name">{buyer.name}</p>
                <span className="buyer-time">{buyer.time}</span>
              </div>
            ))}
          </div>
          */}
        </aside>

        <section className="dashboard-content">
          <div className="content-header">
            <h2>{activeTab}</h2>
            <button onClick={handleAddProduct} className="add-product-button">
              + Add New Product
            </button>
          </div>

          {/* PRODUCT LISTING */}
          <div className="product-listings-grid">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onDelete={() => handleDeleteProduct(product)} // 👈 pass delete handler
              />
            ))}
          </div>
          {/*}
          <h2 className="orders-header">Recent Orders</h2>
          <div className="recent-orders-list">
            {recentOrders.map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-details">
                  <p className="order-store">{order.store}</p>
                  <p className="order-description">{order.details}</p>
                </div>
                <div className="order-status-group">
                  <span className="order-amount">₹{order.amount}</span>
                  <span className={`order-status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>*/}
        </section>
      </main>

      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        query={searchQuery} 
      />

      {/* ✅ Toaster container */}
      <ToastContainer />
    </div>
  );
}

export default FarmerDashboard;
