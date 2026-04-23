// tests/unit/createorder.unit.test.js
const request = require("supertest");
const express = require("express");
const Order = require("../../models/order"); // import your Order model
const app = express();
app.use(express.json());

// Mock API route
app.post("/smartmandi/order/createOrder", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "order placed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock the Order model
jest.mock("../../models/order");

describe("POST /smartmandi/order/createOrder - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create order successfully", async () => {
    const orderData = {
      vendorId: "64f3b5d2f2e5f1a123456789",
      farmerId: "64f3b5d2f2e5f1a987654321",
      productId: "64f3b5d2f2e5f1a112233445",
      deliveryAddress: "Mumbai",
      quantity: 10,
      totalAmount: 500,
    };

    // Create a save mock
    const saveMock = jest.fn().mockResolvedValue(orderData);

    // Mock constructor to return an object with save method
    Order.mockImplementation(() => ({
      save: saveMock,
    }));

    const res = await request(app)
      .post("/smartmandi/order/createOrder")
      .send(orderData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("order placed successfully");
    expect(Order).toHaveBeenCalledWith(orderData);
    expect(saveMock).toHaveBeenCalledTimes(1); // assert save was called
  });

  it("should handle errors during order creation", async () => {
    const orderData = {
      vendorId: "invalid",
      farmerId: "invalid",
    };

    const saveMock = jest.fn().mockRejectedValue(new Error("DB failed"));

    Order.mockImplementation(() => ({
      save: saveMock,
    }));

    const res = await request(app)
      .post("/smartmandi/order/createOrder")
      .send(orderData);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB failed");
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
