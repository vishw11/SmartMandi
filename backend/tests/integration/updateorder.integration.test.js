const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // your main Express app
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

describe("PUT /smartmandi/order/updateOrder - INTEGRATION", () => {
  test("should update order successfully", async () => {
    // Create a sample product
    const product = await Product.create({
      FarmerID: new mongoose.Types.ObjectId(),
      ProductName: "Onion",
      Category: "Vegetable",
      Description: "Fresh onions",
      PricePerUnit: 30,
      UnitType: "kg",
      QuantityAvailable: 100,
      MinimumOrderQuantity: 5,
      ListingDate: "2025-11-05",
      Status: "Available",
      rating: 4.5,
      images: ["onion.jpg"],
    });

    // Create order
    const order = await Order.create({
      vendorId: new mongoose.Types.ObjectId(),
      farmerId: new mongoose.Types.ObjectId(),
      productId: product._id,
      deliveryAddress: "Mumbai, India",
      quantity: 20,
      totalAmount: 600,
      orderStatus: "New",
      paymentStatus: "Pending",
    });

    // Update order status
    const res = await request(app)
      .put("/smartmandi/order/updateOrder")
      .send({
        orderId: order._id,
        orderDetail: { orderStatus: "Delivered", paymentStatus: "Paid" },
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("order details updated successfully");

    // Verify in DB
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.orderStatus).toBe("Delivered");
    expect(updatedOrder.paymentStatus).toBe("Paid");
  });

  test("should return 500 if DB operation fails", async () => {
    // Mock method temporarily to throw
    const originalUpdate = Order.findByIdAndUpdate;
    Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .put("/smartmandi/order/updateOrder")
      .send({
        orderId: new mongoose.Types.ObjectId(),
        orderDetail: { orderStatus: "Cancelled" },
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");

    // Restore
    Order.findByIdAndUpdate = originalUpdate;
  });
});
