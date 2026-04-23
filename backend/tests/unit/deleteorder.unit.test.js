const request = require("supertest");
const express = require("express");

// Mock Order model
const Order = { findByIdAndDelete: jest.fn() };

// Create express app with route
const app = express();
app.use(express.json());
app.delete("/smartmandi/order/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Order.findByIdAndDelete(id, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Order does not exist" });
    }
    res.status(200).json({ message: "Order details deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

describe("DELETE /smartmandi/order/delete/:id - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an order successfully", async () => {
    Order.findByIdAndDelete.mockResolvedValue({ _id: "123", product: "Wheat" });

    const res = await request(app).delete("/smartmandi/order/delete/123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Order details deleted successfully");
    expect(Order.findByIdAndDelete).toHaveBeenCalledWith("123", { new: true });
  });

  it("should return 404 if order not found", async () => {
    Order.findByIdAndDelete.mockResolvedValue(null);

    const res = await request(app).delete("/smartmandi/order/delete/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Order does not exist");
  });

  it("should return 500 if DB error occurs", async () => {
    Order.findByIdAndDelete.mockRejectedValue(new Error("DB error"));

    const res = await request(app).delete("/smartmandi/order/delete/999");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });
});
