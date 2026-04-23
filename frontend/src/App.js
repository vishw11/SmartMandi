import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';

// Auth Pages
import SelectLogin from './pages/Auth/SelectLogin';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';

// Farmer Pages
import FarmerDashboard from './pages/Farmer/FarmerDashboard';
import AddProduct from './pages/Farmer/AddProduct';
import SalesOrders from './pages/Farmer/SalesOrders';
import OrderDetails from './pages/Farmer/OrderDetails';
import FarmerEditProfile from './pages/Farmer/FarmerEditProfile';
import PriceAnalysis from './pages/Farmer/PriceAnalysis';
import EditProduct from './pages/Farmer/EditProduct';

// Vendor Pages
import VendorDashboard from './pages/Vendor/VendorDashboard';
import BrowseProducts from './pages/Vendor/BrowseProducts';
import ProductDetails from './pages/Vendor/ProductDetails';
import VendorOrders from './pages/Vendor/VendorOrders';
import VendorEditProfile from './pages/Vendor/VendorEditProfile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) return <Navigate to="/" replace />;
  //if (allowedRoles && !allowedRoles.includes(userRole)) {
    // redirect to their dashboard
    //return <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} replace />;
  //}
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SelectLogin />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
      <Route path="/farmer/add-product" element={<AddProduct />}/>
      <Route path="/farmer/orders" element={<SalesOrders />} />
      <Route path="/farmer/orderDetails" element={<OrderDetails />} />
      <Route path="/farmer/edit-profile" element={<FarmerEditProfile />} />
      <Route path="/farmer/settings/analysis" element={<ProtectedRoute allowedRoles={['Farmer']}><PriceAnalysis /></ProtectedRoute>} />
      <Route path="/farmer/edit-product" element={<EditProduct />}/>

      <Route path="/vendor/dashboard" element={<VendorDashboard />} />
      <Route path="/vendor/browseProducts" element={<BrowseProducts />} />
      <Route path="/vendor/productDetails" element={<ProductDetails />} />
      <Route path="/vendor/orders" element={<VendorOrders />} />
      <Route path="/vendor/editProfile" element={<VendorEditProfile />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;