import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faChartLine, faShoppingBasket, faCog, faSignOutAlt,
    faBell, faTruck, faDollarSign, faFilter
} from '@fortawesome/free-solid-svg-icons';
import "./SalesOrders.css"
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Sub-Component: Status/Payment Badges ---
const StatusBadge = ({ text }) => {
    const statusToClass = (t) => {
        t = t.toLowerCase().replace(/ /g, '-');
        if (t.includes('new')) return 'status-new-action';
        if (t.includes('delivered')) return 'status-outbound';
        if (t.includes('accepted')) return 'status-intransit';
        if (t.includes('processing')) return 'status-processing';
        if (t.includes('paid')) return 'status-paid';
        if (t.includes('pending')) return 'status-payment-due';
        return 'status-default';
    };
    return <span className={`status-badge-table ${statusToClass(text)}`}>{text}</span>;
};

// --- MAIN SALES ORDERS COMPONENT ---
function SalesOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]); // Default to an empty array
    const [totalSales] = useState(25);

    // --- Dynamic Mock Metrics Based on Orders ---
    const mockMetrics = {
        newOrders: orders.filter(o => o.orderStatus?.toLowerCase() === "accepted").length,

        pendingDelivery: orders.filter(o => 
            o.orderStatus?.toLowerCase() === "new" ||
            o.orderStatus?.toLowerCase() === "accepted"
        ).length,

        paymentsDue: orders
            .filter(o => o.paymentStatus?.toLowerCase() === "pending")
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    };

    // --- Handlers ---
    const handleViewDetails = (order) => {
        navigate(`/farmer/orderDetails`, { state: order }); 
    };
    
    const handleFilterOrders = () => {
        alert('Opening Date/Status Filter Modal...');
    };

    const handleLogout = () => {
        navigate('/login');
    };

    useEffect(() => {
        try {
            const id = localStorage.getItem("id");
            axios.get(`http://localhost:5000/smartmandi/farmer/getAllOrders/${id}`).then(response => {
                console.log(response.data);
                
                setOrders(Array.isArray(response.data) ? response.data : []);

                if((Array.isArray(response.data) ? response.data : []).length === 0)
                    toast.error("No orders found");
            });
        } catch (apiError) {
            toast.error("Error in fetching orders");
        }
    }, []);

    return (
        <div className="sales-orders-container">
            {/* --- SIDEBAR --- */}
            <aside className="sidebar-nav">
                <h1 className="sidebar-logo">SmartMandi</h1>
                <p className="farmer-portal-text">Farmer Portal</p>
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

            {/* --- MAIN CONTENT AREA --- */}
            <main className="sales-orders-main-content">
                <header className="orders-header">
                    <h2>Sales Orders</h2>
                    <p className="orders-subtitle">
                        Track all incoming and completed purchase orders from vendors.
                    </p>
                    <button onClick={handleFilterOrders} className="filter-button">
                        <FontAwesomeIcon icon={faFilter} style={{marginRight: '5px'}} /> Filter Orders
                    </button>
                </header>

                {/* --- METRICS ROW --- */}
                <section className="metrics-row-sales">
                    <div className="metric-card-sale action-needed">
                        <span className="metric-value">{mockMetrics.newOrders}</span>
                        <p className="metric-label">New Orders (Action Needed)</p>
                        <FontAwesomeIcon icon={faBell} className="metric-icon-sale" />
                    </div>
                    <div className="metric-card-sale pending-delivery">
                        <span className="metric-value">{mockMetrics.pendingDelivery}</span>
                        <p className="metric-label">Pending Delivery</p>
                        <FontAwesomeIcon icon={faTruck} className="metric-icon-sale" />
                    </div>
                    <div className="metric-card-sale payments-due">
                        <span className="metric-value">₹ {mockMetrics.paymentsDue.toLocaleString('en-IN')}</span>
                        <p className="metric-label">Payments Due</p>
                        <FontAwesomeIcon icon={faDollarSign} className="metric-icon-sale" />
                    </div>
                </section>

                {/* --- ORDERS TABLE --- */}
                <section className="orders-table-section">
                    <h3>All Sales ({orders.length   } Total)</h3>
                    
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Product Sold</th>
                                    <th>Quantity</th>
                                    <th>Vendor (Buyer)</th>
                                    <th>Total Amount</th>
                                    <th>Order Status</th>
                                    <th>Payment Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(orders) && orders.length > 0 ? (
                                    orders.map((order, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{order.productId?.ProductName}</td>
                                            <td>{order.quantity}</td>
                                            <td>{order.vendorId?.fullName}</td>
                                            <td>₹ {order.totalAmount?.toLocaleString('en-IN')}</td>
                                            <td><StatusBadge text={order.orderStatus} /></td>
                                            <td><StatusBadge text={order.paymentStatus} /></td>
                                            <td>
                                                <button 
                                                    onClick={() => handleViewDetails(order)} 
                                                    className="action-view-button"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-orders">
                                            No orders available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <p className="table-footer">
                        Showing {orders.length} Sales Orders.
                    </p>
                </section>
                
            </main>
            <ToastContainer/>
        </div>
    );
}

export default SalesOrders;
