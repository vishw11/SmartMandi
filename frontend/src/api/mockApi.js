// src/api/mockApi.js
// Centralized mock API with in-memory data and async functions to simulate network calls.

const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// In-memory datasets
let products = [
  { id: 301, name: 'Organic Tomatoes', price: 35, unit: 'kg', farmer: 'Sanket Farms', stock: 500, description: 'Fresh vine-ripened tomatoes.' },
  { id: 302, name: 'Fresh Bananas', price: 45, unit: 'dozen', farmer: 'Green Orchard', stock: 200, description: 'Sweet ripe bananas.' },
  { id: 303, name: 'Brown Rice (5kg)', price: 220, unit: 'bag', farmer: 'GrainHouse', stock: 120, description: 'Premium brown rice.' },
];

let farmerOrders = [
  { id: 9012, product: "Organic Tomatoes", qty: "1500 kg", vendor: "Dharwad Market", total: "₹52,500", status: "Delivered", payment: "Paid" },
  { id: 9013, product: "Premium Wheat", qty: "50 Quintals", vendor: "Fresh Greens", total: "₹1,10,000", status: "New Order", payment: "Awaiting Payment" },
];

let vendorOrders = [
  { id: 5001, product: 'Organic Tomatoes', qty: '200 kg', total: '₹7,000', status: 'Awaiting Pickup' },
  { id: 5002, product: 'Brown Rice (5kg)', qty: '20 bags', total: '₹4,400', status: 'Delivered' },
];

let users = [
  { role: 'Farmer', email: 'farmer@example.com', name: 'Sanket Hiremath', id: 'FM401' },
  { role: 'Vendor', email: 'vendor@example.com', name: 'Vishw Vora', id: 'VEN105' },
];

export async function loginUser(role, email, password) {
  await delay(300);
  const user = users.find(u => u.role === role && (!email || u.email === email));
  if (!user) throw new Error('Invalid credentials');
  return { token: 'mock-token', user };
}

export async function getProducts() {
  await delay();
  return products.slice(); // return copy
}

export async function getProductById(id) {
  await delay();
  const found = products.find(p => String(p.id) === String(id));
  return found || null;
}

export async function addProduct(product) {
  await delay();
  const id = Math.max(...products.map(p=>p.id), 300) + 1;
  const newProd = { id, ...product };
  products.push(newProd);
  return newProd;
}

export async function updateProduct(id, updates) {
  await delay();
  const idx = products.findIndex(p => String(p.id) === String(id));
  if (idx === -1) throw new Error('Product not found');
  products[idx] = { ...products[idx], ...updates };
  return products[idx];
}

export async function getFarmerOrders() {
  await delay();
  return farmerOrders.slice();
}

export async function getFarmerOrderById(orderId) {
  await delay();
  return farmerOrders.find(o => String(o.id) === String(orderId)) || null;
}

export async function getVendorOrders() {
  await delay();
  return vendorOrders.slice();
}

export async function getVendorOrderById(orderId) {
  await delay();
  return vendorOrders.find(o => String(o.id) === String(orderId)) || null;
}

export async function getPriceAnalysis(product = 'Organic Tomatoes', range = '30d') {
  await delay();
  // Simple generated analysis
  return {
    product,
    range,
    avgMarketPrice: 32.5,
    avgSellingPrice: 35.5,
    highestPrice: 45.0,
    priceTrend: -4.2,
    series: Array.from({length: 30}, (_,i) => ({ day: i+1, price: 30 + Math.sin(i/5)*5 + Math.random()*2 }))
  };
}

export async function searchProducts(query) {
  await delay(200);
  const q = (query || '').toLowerCase();
  return products.filter(p => p.name.toLowerCase().includes(q) || p.farmer.toLowerCase().includes(q));
}