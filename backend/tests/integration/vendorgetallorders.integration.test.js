const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // your Express app
const Order = require("../../models/order");
const Product = require("../../models/product");

let mongoServer;

// Extend Jest timeout
jest.setTimeout(60000);

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({ binary: { version: "7.0.5" } });
  } catch {
    mongoServer = await MongoMemoryServer.create({ binary: { version: "6.0.6" } });
  }

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  mongoose.set("debug", true);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Order.deleteMany({});
  await Product.deleteMany({});
});

describe("GET /smartmandi/vendor/getAllOrders/:vendorId - INTEGRATION", () => {
  test("should return all orders for a vendor", async () => {
    // Create sample product
    const product = await Product.create({
      FarmerID: new mongoose.Types.ObjectId(),
      ProductName: "Wheat",
      Category: "Grains",
      Description: "Organic wheat",
      PricePerUnit: 50,
      UnitType: "kg",
      QuantityAvailable: 500,
      MinimumOrderQuantity: 10,
      ListingDate: "2025-11-05",
      Status: "Available",
      rating: 4.2,
      images: ["wheat.jpg"],
    });

    const vendorId = new mongoose.Types.ObjectId();
    const farmerId = new mongoose.Types.ObjectId();

    // Create order
    await Order.create({
      vendorId,
      farmerId,
      productId: product._id,
      deliveryAddress: "Delhi, India",
      quantity: 10,
      totalAmount: 500,
    });

    const res = await request(app).get(`/smartmandi/vendor/getAllOrders/${vendorId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].vendorId.toString()).toBe(vendorId.toString());
    expect(res.body[0].productId.rating).toBe(4.2);
  });

  test("should return 200 with 'No orders found' if vendor has no orders", async () => {
    const res = await request(app).get(`/smartmandi/vendor/getAllOrders/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No orders found");
  });

  test("should return 500 on server error", async () => {
    // Temporarily mock Order.find to throw an error
    const originalFind = Order.find;
    Order.find = jest.fn().mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await request(app).get(`/smartmandi/vendor/getAllOrders/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");

    // Restore original method
    Order.find = originalFind;
  });
});
