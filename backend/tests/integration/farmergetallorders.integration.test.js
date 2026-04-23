const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // Your Express app
const Order = require("../../models/order");
const Farmer = require("../../models/farmer");
const Vendor = require("../../models/vendor");
const Product = require("../../models/product");

let mongoServer;
jest.setTimeout(60000);

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
  await Farmer.deleteMany({});
  await Vendor.deleteMany({});
  await Product.deleteMany({});
});

describe("GET /smartmandi/farmer/getAllOrders/:farmerId - INTEGRATION", () => {
  it("should return all orders for a farmer", async () => {
    const farmer = await Farmer.create({
      fullName: "Farmer1",
      email: "farmer1@example.com",
      password: "12345",
      phoneNumber: "8888888888",
      city: "Delhi",
      district: "Central",
      pincode: "110001",
    });

    const vendor = await Vendor.create({
      fullName: "Vendor1",
      email: "vendor1@example.com",
      password: "12345",
      phoneNumber: "9999999999",
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

    await Order.create([
      {
        vendorId: vendor._id,
        farmerId: farmer._id,
        productId: product._id,
        deliveryAddress: "Delhi",
        quantity: 5,
        totalAmount: 250,
      },
      {
        vendorId: vendor._id,
        farmerId: farmer._id,
        productId: product._id,
        deliveryAddress: "Delhi",
        quantity: 10,
        totalAmount: 500,
      },
    ]);

    const res = await request(app).get(`/smartmandi/farmer/getAllOrders/${farmer._id}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].farmerId.toString()).toBe(farmer._id.toString());
  });

  it("should return 'No orders found' if farmer has no orders", async () => {
    const farmer = await Farmer.create({
      fullName: "Farmer2",
      email: "farmer2@example.com",
      password: "12345",
      phoneNumber: "8888888888",
      city: "Delhi",
      district: "Central",
      pincode: "110002",
    });

    const res = await request(app).get(`/smartmandi/farmer/getAllOrders/${farmer._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No orders found");
  });

  it("should return 500 if DB throws error", async () => {
    // Simulate DB failure
    const originalFind = Order.find;
    Order.find = jest.fn().mockRejectedValue(new Error("DB failed"));

    const res = await request(app).get("/smartmandi/farmer/getAllOrders/12345");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");

    Order.find = originalFind; // Restore
  });
});
