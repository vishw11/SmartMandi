const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  vendorId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  farmerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  productId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  orderDate:{
    type: Date,
    default: Date.now,
    required: true,
  },
  deliveryAddress:{
    type: String,
    required:true,
    trim: true
  },
  deliveryDate: {
    type: Date,
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount:{
    type: Number,
    required: true,
    min: 0
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'New'
  },
  paymentStatus: {
    type: String,
    required: true,
    default: 'Pending'
  },
  rating: { type: Number}
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
