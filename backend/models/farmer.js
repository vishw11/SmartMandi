const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
  bankAccountNumber: { type: String},
  ifscCode: { type: String},
  accountHolderName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Farmer", farmerSchema);
