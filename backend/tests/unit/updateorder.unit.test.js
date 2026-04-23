const request = require("supertest");
const express = require("express");

// Mock Order model
const Order = { findByIdAndUpdate: jest.fn() };

// Build test app
const app = express();
app.use(express.json());

// Mount route (directly as in your code)
app.put("/smartmandi/order/updateOrder", async (req, res) => {
  try {
    const updateData = req.body.orderDetail;
    await Order.findByIdAndUpdate(req.body.orderId, updateData, { new: true });
    res.json({ message: "order details updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error fetching order details" });
  }
});

describe("PUT /smartmandi/order/updateOrder - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update order successfully", async () => {
    Order.findByIdAndUpdate.mockResolvedValue({ _id: "123", status: "Delivered" });

    const res = await request(app)
      .put("/smartmandi/order/updateOrder")
      .send({
        orderId: "123",
        orderDetail: { orderStatus: "Delivered" },
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("order details updated successfully");
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      "123",
      { orderStatus: "Delivered" },
      { new: true }
    );
  });

  it("should handle server errors", async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error("DB failed"));

    const res = await request(app)
      .put("/smartmandi/order/updateOrder")
      .send({
        orderId: "999",
        orderDetail: { orderStatus: "Cancelled" },
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");
  });
});
