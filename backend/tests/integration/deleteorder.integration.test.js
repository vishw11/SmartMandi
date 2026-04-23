const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // your Express app
const Order = require("../../models/order");
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
  await Product.deleteMany({});
});

describe("DELETE /smartmandi/order/delete/:id - INTEGRATION", () => {
  test("should delete an existing order", async () => {
    const product = await Product.create({
      FarmerID: new mongoose.Types.ObjectId(),
      ProductName: "Tomato",
      Category: "Vegetable",
      Description: "Fresh red tomatoes",
      PricePerUnit: 20,
      UnitType: "kg",
      QuantityAvailable: 100,
      MinimumOrderQuantity: 5,
      ListingDate: "2025-11-05",
      Status: "Available",
      rating: 4.8,
      images: ["tomato.jpg"],
    });

    const order = await Order.create({
      vendorId: new mongoose.Types.ObjectId(),
      farmerId: new mongoose.Types.ObjectId(),
      productId: product._id,
      deliveryAddress: "Delhi, India",
      quantity: 15,
      totalAmount: 300,
      orderStatus: "New",
      paymentStatus: "Pending",
    });

    const res = await request(app).delete(`/smartmandi/order/delete/${order._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order details deleted successfully");

    // Verify DB record removed
    const check = await Order.findById(order._id);
    expect(check).toBeNull();
  });

  test("should return 404 if order does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/smartmandi/order/delete/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Order does not exist");
  });

  test("should return 500 on DB error", async () => {
    const original = Order.findByIdAndDelete;
    Order.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("DB failure"));

    const res = await request(app).delete(`/smartmandi/order/delete/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB failure");

    // restore
    Order.findByIdAndDelete = original;
  });
});
