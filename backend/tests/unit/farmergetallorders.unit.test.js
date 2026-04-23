const request = require("supertest");
const express = require("express");

// Mock Order model
const Order = { find: jest.fn() };

// Express app
const app = express();
app.get("/smartmandi/farmer/getAllOrders/:farmerId", async (req, res) => {
  try {
    const orderList = await Order.find({ farmerId: req.params.farmerId });
    if (orderList.length === 0) {
      return res.status(200).json({ message: `No orders found` });
    }
    res.json(orderList);
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

describe("GET /smartmandi/farmer/getAllOrders/:farmerId - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return orders for a farmer", async () => {
    const fakeOrders = [{ _id: "1" }, { _id: "2" }];
    Order.find.mockResolvedValue(fakeOrders);

    const res = await request(app).get("/smartmandi/farmer/getAllOrders/12345");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrders);
    expect(Order.find).toHaveBeenCalledWith({ farmerId: "12345" });
  });

  it("should return 'No orders found' if none exist", async () => {
    Order.find.mockResolvedValue([]);

    const res = await request(app).get("/smartmandi/farmer/getAllOrders/12345");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No orders found");
  });

  it("should return 500 if DB throws error", async () => {
    Order.find.mockRejectedValue(new Error("DB failed"));

    const res = await request(app).get("/smartmandi/farmer/getAllOrders/12345");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");
  });
});
