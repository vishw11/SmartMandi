// VendorOrders.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// --- THIRD-PARTY RATING LIBRARY ---
import ReactStars from 'react-rating-stars-component';
// --- FONT AWESOME IMPORTS (Used for navigation/metrics icons) ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import {
  faFilter,
  faExclamationTriangle,
  faTruck,
  faCheckCircle,
  faShoppingBasket,
  faTachometerAlt,
  faLeaf,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import "./VendorOrders.css";

// --- Sub-Component: Status/Payment Badges ---
const StatusBadge = ({ text }) => {
  const statusToClass = (t) => {
    t = (t || '').toLowerCase().replace(/ /g, '-');
    if (t.includes('required') || t.includes('due')) return 'status-payment-due';
    if (t.includes('accepted')) return 'status-accepted';
    if (t.includes('delivered')) return 'status-delivered';
    if (t.includes('rejected')) return 'status-rejected';
    if (t.includes('new') ) return 'status-new';
    if (t.includes('pending')) return 'status-pending';
    if (t.includes('paid')) return 'status-paid';
    return 'status-default';
  };
  return <span className={`status-badge-table ${statusToClass(text)}`}>{text}</span>;
};

// --- Sub-Component: Star Rating (Using ReactStars) ---
const StarRating = ({ rating, oid, onRate }) => {
  const isRated = rating > 0;
  const ratingChanged = (newRating) => {
    if (!isRated) {
      onRate(oid, newRating);
    }
  };

  return (
    <div className="star-rating-wrapper">
      <ReactStars
        count={5}
        size={20}
        value={rating}
        edit={!isRated}
        isHalf={false}
        activeColor="#FFC107"
        color="#ccc"
        onChange={ratingChanged}
      />
    </div>
  );
};

// --- Sub-Component: Filter Modal ---
const FilterByDateModal = ({ isOpen, onClose, onApply }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="filter-modal-backdrop" onClick={onClose}>
      <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Filter Orders by Date</h3>
        <div className="filter-date-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-date-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleApply} className="modal-apply-button">Apply Filter</button>
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
};

// --- MAIN MY ORDERS COMPONENT ---
function VendorOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [totalOrders] = useState(24); // static totalOrders kept as your UI expects

  // --- Compute metrics from orders using useMemo for performance ---
  const metrics = useMemo(() => {
    let paymentsDue = 0;
    let ordersNew = 0;
    let totalDelivered = 0;

    orders.forEach((order) => {
      const orderStatus = (order.orderStatus || '').toLowerCase();
      const paymentStatus = (order.paymentStatus || '').toLowerCase();

      // Determine payments due: heuristics - contains 'due' or 'required' or 'unpaid' or 'pending' but not 'paid'
      if (
        paymentStatus.includes('due') ||
        paymentStatus.includes('required') ||
        paymentStatus.includes('unpaid') ||
        (paymentStatus.includes('pending') && !paymentStatus.includes('paid')) ||
        (!paymentStatus && (orderStatus === 'new' || orderStatus === 'accepted')) // fallback
      ) {
        paymentsDue += 1;
      }

      // Determine in-transit orders
      if (orderStatus.includes('accepted')) {
        ordersNew += 1;
      }

      // Delivered orders
      if (orderStatus.includes('delivered')) {
        totalDelivered += 1;
      }
    });

    return {
      paymentsDue,
      ordersNew,
      totalDelivered
    };
  }, [orders]);

  // --- Handlers ---
  const handleRateOrder = (oid, rating) => {
    // Optimistically update UI and send API
    setOrders((prev) => prev.map((o) => (o._id === oid ? { ...o, rating } : o)));

    axios
      .put('http://localhost:5000/smartmandi/order/giveRating', {
        orderId: oid,
        rating: rating
      })
      .then((response) => {
        // Optionally reconcile server response if needed
        console.log('Rating submitted:', response.data);
      })
      .catch((error) => {
        console.error('Error submitting rating:', error);
        // revert optimistic update if you want (not implemented here)
      });
  };

  const handleFilterApply = (startDate, endDate) => {
    // implement filtering logic if desired; currently left blank for integration
  };

  const handlePayNow = async (order) => {
    const checkout = {
      vendorId: order.vendorId,
      farmerId: order.farmerId,
      productId: order.productId && order.productId._id ? order.productId._id : (order.productId || ''),
      quantity: order.quantity,
      totalAmount: order.totalAmount,
      _id: order._id
    };

    try {
      const response = await axios.post('http://localhost:5000/smartmandi/payment/checkout', checkout);
      // expect response.data.url
      const url = response && response.data && response.data.url;
      if (url) {
        // redirect the browser
        window.location.href = url;
      } else {
        console.error('No checkout URL returned', response.data);
        alert('Payment start failed: no redirect URL received.');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start payment. Check console for details.');
    }
  };

  // --- NEW: Delete handler for 'new' orders ---
  const handleDeleteOrder = async (orderId) => {
    // confirm with user
    const ok = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!ok) return;

    // optimistic UI: remove locally first
    const prevOrders = [...orders];
    setOrders((prev) => prev.filter((o) => o._id !== orderId));

    try {
      await axios.delete(`http://localhost:5000/smartmandi/order/delete/${orderId}`);
      console.log('Order deleted:', orderId);
    } catch (error) {
      console.error('Error deleting order:', error);
      setOrders(prevOrders);
      alert('Failed to delete order. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear tokens/localStorage if required
    navigate('/login');
  };

  // --- Fetch orders on mount ---
  useEffect(() => {
    const id = localStorage.getItem('id');
    if (!id) {
      // if no id, either redirect to login or handle gracefully
      console.warn('Vendor id not found in localStorage');
      return;
    }

    axios
      .get(`http://localhost:5000/smartmandi/vendor/getAllOrders/${id}`)
      .then((response) => {
        // assume response.data is an array of orders
        const data = Array.isArray(response.data) ? response.data : (response.data.orders || []);
        setOrders(data);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setOrders([]); // fallback to empty array
      });
  }, []);

  // --- Render ---
  return (
    <div className="my-orders-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar-nav">
        <h1 className="sidebar-logo">SmartMandi</h1>
        <p className="vendor-portal-text">Vendor Portal</p>
        <nav className="nav-menu">
          <a href="/vendor/dashboard" className="nav-item">
            <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '10px' }} /> Dashboard
          </a>
          <a href="/vendor/browseProducts" className="nav-item">
            <FontAwesomeIcon icon={faLeaf} style={{ marginRight: '10px' }} /> Browse Products
          </a>
          <a href="/vendor/orders" className="nav-item active">
            <FontAwesomeIcon icon={faShoppingBasket} style={{ marginRight: '10px' }} /> My Orders
          </a>
          <a href="/vendor/editProfile" className="nav-item">
            <FontAwesomeIcon icon={faCog} style={{ marginRight: '10px' }} /> Settings
          </a>
          <a href="#" onClick={handleLogout} className="nav-item logout-link">
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '10px' }} /> Logout
          </a>
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="orders-main-content">
        <header className="orders-header">
          <h2>My Purchase Orders</h2>
          <p className="orders-subtitle">
            Track the status, payment, and delivery of all orders placed with SmartMandi farmers.
          </p>
          {/*<button onClick={() => setIsFilterModalOpen(true)} className="filter-button">
            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '5px' }} /> Filter by Date
          </button>*/}
        </header>

        {/* --- METRICS ROW --- */}
        <section className="metrics-row-orders">
          <div className="metric-card-order due">
            <span className="metric-value">{metrics.paymentsDue}</span>
            <p className="metric-label">Payments Due (Immediate Action)</p>
            <FontAwesomeIcon icon={faExclamationTriangle} className="metric-icon-small" />
          </div>
          <div className="metric-card-order transit">
            <span className="metric-value">{metrics.ordersNew}</span>
            <p className="metric-label">New Orders</p>
            <FontAwesomeIcon icon={faTruck} className="metric-icon-small" />
          </div>
          <div className="metric-card-order delivered">
            <span className="metric-value">{metrics.totalDelivered}</span>
            <p className="metric-label">Total Delivered Orders</p>
            <FontAwesomeIcon icon={faCheckCircle} className="metric-icon-small" />
          </div>
        </section>

        {/* --- ORDERS TABLE --- */}
        <section className="orders-table-section">
          <h3>All Purchase Orders ({totalOrders} Total)</h3>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date Placed</th>
                  <th>Total Amount</th>
                  <th>Product Name</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={order._id || index}>
                      <td>{index + 1}</td>
                      <td>
                        {order.orderDate
                          ? (new Date(order.orderDate)).toISOString().split('T')[0]
                          : '—'}
                      </td>
                      <td>
                        ₹{' '}
                        {(typeof order.totalAmount === 'number')
                          ? order.totalAmount.toLocaleString('en-IN')
                          : order.totalAmount || '0'}
                      </td>
                      <td>
                        {order.productId.ProductName}
                      </td>
                      {<td>
                        <StatusBadge text={order.orderStatus || 'Unknown'} />
                      </td>}
                      <td>
                        <StatusBadge text={order.paymentStatus || 'Unknown'} />
                      </td>
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* If payment is due, show Pay Now */}
                        {(
                          (order.orderStatus || '').toLowerCase().includes('accepted')) && 
                           ((order.paymentStatus || '').toLowerCase().includes('pending')) &&
                          (
                          <button onClick={() => handlePayNow(order)} className="action-pay-button">
                            Pay Now
                          </button>
                        )}

                        {/* If delivered, show the Star Rating */}
                        {(order.orderStatus || '').toLowerCase().includes('delivered') && (
                          <StarRating rating={order.rating || 0} oid={order._id} onRate={handleRateOrder} />
                        )}

                        {/* If order is new, show Delete button */}
                        {(order.paymentStatus || '').toLowerCase().includes('pending') && (
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="action-delete-button"
                            title="Delete Order"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="table-footer">
            Showing {orders.length} Purchase Orders.
          </p>
        </section>
      </main>

      {/* Filter Modal */}
      <FilterByDateModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleFilterApply}
      />
    </div>
  );
}

export default VendorOrders;
