import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faChartLine, faShoppingBasket, faCog, faSignOutAlt,
    faUser, faMapMarkerAlt, faShippingFast, faCheckCircle, faTimesCircle,
    faExclamationTriangle, faMoneyBillWave, faTruck
} from '@fortawesome/free-solid-svg-icons';
import axios from "axios"
import "./OrderDetails.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // <-- important!

function OrderDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(location.state);
    const [isLoading, setIsLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(location.state.orderStatus); // To track acceptance status

    // --- Financial Calculations ---
    const commissionAmount = order ? order.grossSaleValue * order.smartMandiCommissionRate : 0;
    const netPayable = order ? order.grossSaleValue - commissionAmount - order.logisticsFee : 0;

    // --- OTP states for Delivery flow (new, does not modify existing order logic) ---
    const [otp, setOtp] = useState(null); // the generated OTP (would normally be server-side)
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');

    // --- Action Handlers ---
    const handleConfirmAcceptance = () => {
        const updateOrder = {
            "orderId":order._id,
            "orderDetail":{
            "orderStatus":"Accepted",
            "quantity": order.quantity,
            "productId": order.productId._id
            }
        }
        console.log("hi",updateOrder)
        try{
            axios.put("http://localhost:5000/smartmandi/order/updateOrder",updateOrder).then(()=>{
                navigate("/farmer/orders")
            })
        }catch{

        }

        
    };

    const handleRejectOrder = () => {
        const updateOrder = {
            "orderId":order._id,
            "orderDetail":{
            "orderStatus":"Rejected",
            "quantity": order.quantity,
            "productId": order.productId._id
            }
        }
        try{
            axios.put("http://localhost:5000/smartmandi/order/updateOrder",updateOrder).then(()=>{
                navigate("/farmer/orders")
            })
        }catch{

        }
    };

    const handleBack = () => {
        navigate('/farmer/orders'); 
    };

    // --- OTP handlers (purely client-side stub for demo) ---
    const handleSendOtp = () => {  
        console.log("hello")
        console.log("hi",order.vendorId.email)
        axios.post("http://localhost:5000/smartmandi/user/sendOtp",{
                "email":order.vendorId.email
              }).then(()=>{
                toast.success("OTP sent successfully!", { position: "top-right" })
                setOtpSent(true);
                setOtpVerified(false);
                setOtpError('');
            })
        
    };

    const handleVerifyOtp = () => {
        
        if (!otpSent) {
            setOtpError('Please send OTP first.');
            return;
        }
        axios.post("http://localhost:5000/smartmandi/user/verifyOtp",{
                "otp":otpInput.trim(),
                "email":order.vendorId.email
              }).then(response => {
                if(response.data.status){
                  setOtpVerified(true);
                  setOtpError('');
                  toast.success("OTP verified successfully!", { position: "top-right" })
                }
              }  
              ).catch(error=>{
                setOtpVerified(false);
                toast.error("Wrong OTP!", { position: "top-right" })})
            
    };

    const handleMarkOutForDelivery = () => {
        if (!otpVerified) {
            toast.error('OTP not verified. Please verify OTP before marking out for delivery.',{ position: "top-right" });
            return;
        }
        const updateOrder = {
            "orderId":order._id,
            "orderDetail":{
            "orderStatus":"Delivered",
            }
        }
        try{
            axios.put("http://localhost:5000/smartmandi/order/updateOrder",updateOrder).then(()=>{
                navigate("/farmer/orders")
            })
        }catch{

        }
    };

    if (isLoading || !order) {
        return <div className="detail-page-loading">Loading Order Details...</div>;
    }

    // --- Status Bar and Action Rendering ---
    const isAwaitingAcceptance = orderStatus === 'New';
    const isAccepted = orderStatus === 'Accepted';
    const isRejected = orderStatus === 'Rejected';
    
    let statusBannerClass = '';
    let statusBannerMessage = '';

    if (isAwaitingAcceptance) {
        statusBannerClass = 'status-awaiting';
        statusBannerMessage = `Action needed: Confirm acceptance and prepare for shipment.`;
    } else if (isAccepted) {
        statusBannerClass = 'status-accepted';
        statusBannerMessage = `Order Confirmed: Accepted on ${new Date().toLocaleDateString()}. Prepare shipment for pickup.`;
    } else if (isRejected) {
        statusBannerClass = 'status-rejected';
        statusBannerMessage = `Order Rejected.`;
    }

    return (
        <div className="order-detail-page">
            {/* --- SIDEBAR --- */}
            <aside className="sidebar-nav">
                <h1 className="sidebar-logo">SmartMandi</h1>
                <p className="portal-text">Farmer Portal</p>
                <nav className="nav-menu">
                    <a href="/farmer/dashboard" className="nav-item"><FontAwesomeIcon icon={faTachometerAlt} style={{marginRight: '10px'}} /> Dashboard</a>
                    <a href="/farmer/analytics" className="nav-item"><FontAwesomeIcon icon={faChartLine} style={{marginRight: '10px'}} /> Analytics</a>
                    <a href="/farmer/orders" className="nav-item active"><FontAwesomeIcon icon={faShoppingBasket} style={{marginRight: '10px'}} /> Sales Orders</a>
                    <a href="/farmer/edit-profile" className="nav-item"><FontAwesomeIcon icon={faCog} style={{marginRight: '10px'}} /> Settings</a>
                    <a href="#" onClick={() => navigate('/login')} className="nav-item logout-link"><FontAwesomeIcon icon={faSignOutAlt} style={{marginRight: '10px'}} /> Logout</a>
                </nav>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="order-detail-main">
                <header className="detail-header">
                    <h2>Sales Order: {order._id}</h2>
                    <p className="detail-subtitle">{statusBannerMessage}</p>
                    <button onClick={handleBack} className="back-button">
                        &larr; Back to Sales
                    </button>
                </header>
                
                {/* --- ORDER STATUS BANNER --- */}
                <div className={`status-banner ${statusBannerClass}`}>
                    <p className="banner-text">
                        <FontAwesomeIcon icon={faExclamationTriangle} /> 
                        &nbsp; New Order - {isAwaitingAcceptance ? 'Awaiting Acceptance' : orderStatus}
                    </p>
                    <p className="banner-subtext">
                        Placed on {new Date(order.createdAt).toLocaleString().split("T")[0]} by {order.vendorId.fullName}.
                        {isAwaitingAcceptance && (
                            <span className="timer-text"> You have 24 hours to confirm acceptance of this order.</span>
                        )}
                    </p>
                </div>

                {/* --- TWO-COLUMN LAYOUT --- */}
                <section className="order-content-layout">
                    
                    {/* --- LEFT COLUMN: PRODUCTS & DETAILS --- */}
                    <div className="order-info-column">
                        <div className="card-product-list">
                            <h3>Products Sold (1 item)</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product / ID</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{order.productId.ProductName}</td>
                                        <td>{order.quantity} {order.unit}</td>
                                        <td>₹ {order.productId.PricePerUnit.toLocaleString('en-IN')}</td>
                                        <td>₹ {order.totalAmount.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="card-section buyer-info-section">
                            <h3>Buyer & Delivery Information</h3>

                            <div className="info-group">
                                <h4 className="info-title"><FontAwesomeIcon icon={faUser} /> Buyer Details</h4>
                                <p>{order.vendorId.fullName}</p>
                                <p>Contact Person: {order.vendorId.phoneNumber}</p>
                            </div>

                            <div className="info-group">
                                <h4 className="info-title"><FontAwesomeIcon icon={faMapMarkerAlt} /> Shipping Address</h4>
                                <p>{order.vendorId.city + " " + order.vendorId.district + " " + order.vendorId.pincode}</p>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: ACTIONS & FINANCIALS --- */}
                    <div className="action-financial-column">
                        
                        {/* Farmer Actions */}
                        <div className="card-action-box">
                            <h3>Farmer Actions</h3>{/*}
                            {isAwaitingAcceptance ? (
                                <>
                                    <button onClick={handleConfirmAcceptance} className="action-button confirm">
                                        <FontAwesomeIcon icon={faCheckCircle} /> Confirm Acceptance
                                    </button>
                                    <button onClick={handleRejectOrder} className="action-button reject">
                                        <FontAwesomeIcon icon={faTimesCircle} /> Reject Order
                                    </button>
                                </>
                            ) : (
                                <p className={`action-status-message ${isAccepted ? 'accepted' : 'rejected'}`}>
                                    Order has been **{orderStatus}**.
                                </p>
                            )}
                            */}
                            {/* Delivery controls (shown regardless, but button disabled until OTP verified) */}
                            {isAccepted && (
                            <div className="card-action-box" style={{marginLeft:"18px"}}>
                                <h4>Delivery</h4>
                                
                                    <button onClick={handleSendOtp} className="otp-button" disabled={!isAccepted} title={!isAccepted ? 'Accept order first' : 'Send OTP'}>Send OTP</button>
                                    <input
                                        type="text"
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        placeholder="Enter OTP"
                                        className="otp-input"
                                        disabled={!otpSent}
                                    />
                                    <button onClick={handleVerifyOtp} className="otp-button verify" disabled={!otpSent}>Verify OTP</button>
                                
                                {otpError && <p className="otp-error">{otpError}</p>}

                                <button onClick={handleMarkOutForDelivery} className="action-button delivery" disabled={!otpVerified}>
                                    <FontAwesomeIcon icon={faShippingFast} /> Mark Out for Delivery
                                </button>
                            </div>)}
                        </div>

                        {/* Financial Overview */}
                        <div className="card-financial-box">
                            <h3>Financial Overview</h3>
                            <div className="financial-summary">
                                <p>Gross Sale Value:</p>
                                <p>₹ {order.totalAmount.toLocaleString('en-IN')}</p>
                                
                                <div className="net-payable">
                                    <p>Net Payable to Farmer:</p>
                                    <p className="net-amount">₹ {order.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <ToastContainer/>
        </div>
    );
}

export default OrderDetails;
