const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // Your Express app
const Order = require("../../models/order");
const Product = require("../../models/product");
const Vendor = require("../../models/vendor");
const Farmer = require("../../models/farmer");

let mongoServer;
jest.setTimeout(120000);

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({ binary: { version: "7.0.5" } });
  } catch {
    mongoServer = await MongoMemoryServer.create({ binary: { version: "6.0.6" } });
  }
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Product.deleteMany({});
  await Vendor.deleteMany({});
  await Farmer.deleteMany({});
});

describe("POST /smartmandi/order/createOrder - INTEGRATION", () => {
  it("should create an order successfully", async () => {
    // Create a vendor, farmer, product
    const vendor = await Vendor.create({
      fullName: "Vendor1",
      email: "vendor1@example.com",
      password: "12345",
      phoneNumber: "9999999999",
      city: "Delhi",
      district: "Central",
      pincode: "110001",
    });

    const farmer = await Farmer.create({
      fullName: "Farmer1",
      email: "farmer1@example.com",
      password: "12345",
      phoneNumber: "8888888888",
      city: "Delhi",
      district: "Central",
      pincode: "110001",
    });

    const product = await Product.create({
      FarmerID: farmer._id,
      ProductName: "Apple",
      Category: "Fruit",
      Description: "Fresh apple",
      PricePerUnit: 50,
      UnitType: "kg",
      QuantityAvailable: 100,
      MinimumOrderQuantity: 1,
      ListingDate: new Date().toISOString(),
      Status: "Available",
      images: ["image1.jpg"],
    });

    const res = await request(app)
      .post("/smartmandi/order/createOrder")
      .send({
        vendorId: vendor._id,
        farmerId: farmer._id,
        productId: product._id,
        deliveryAddress: "Delhi, India",
        quantity: 10,
        totalAmount: 500,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("order placed successfully");

    // Verify saved in DB
    const orderInDB = await Order.findOne({ vendorId: vendor._id });
    expect(orderInDB).not.toBeNull();
    expect(orderInDB.totalAmount).toBe(500);
  });

  it("should return 500 if order save fails", async () => {
    // Temporarily override save
    const originalSave = Order.prototype.save;
    Order.prototype.save = jest.fn().mockRejectedValue(new Error("DB failed"));

    const res = await request(app)
      .post("/smartmandi/order/createOrder")
      .send({
        vendorId:new mongoose.Types.ObjectId(),
        farmerId: new mongoose.Types.ObjectId(),
        productId:new mongoose.Types.ObjectId(),
        deliveryAddress: "Delhi, India",
        quantity: 5,
        totalAmount: 250,
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB failed");

    // Restore original
    Order.prototype.save = originalSave;
  });
});
