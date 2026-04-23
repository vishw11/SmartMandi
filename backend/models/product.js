const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  FarmerID: { type: mongoose.Schema.Types.ObjectId, ref:'Farmer',required: true },
  ProductName: { type: String, required: true },
  Category: { type: String, required: true },
  Description: { type: String, required: true },
  PricePerUnit: { type: Number, required: true },
  UnitType: { type: String, required: true },
  QuantityAvailable: { type: Number, required: true },
  MinimumOrderQuantity: { type: Number,min:0 },
  ListingDate: { type: String, required: true },
  Status: { type: String, required: true },
  images:{ type:[String],required:true}
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);