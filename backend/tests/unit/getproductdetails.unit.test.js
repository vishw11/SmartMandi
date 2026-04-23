// tests/unit/getproduct.unit.test.js
const request = require("supertest");
const express = require("express");
const product = require("../../models/product"); // adjust path
const app = express();

app.use(express.json());
app.get("/smartmandi/product/getProductDetails/:id", async (req, res) => {
  try {
    const product_id = req.params.id;
    const product_details = await product.findById(product_id);
    if (!product_details) {
      return res.status(404).json({ message: "product details are not found" });
    }
    res.status(200).json(product_details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mock Mongoose model
jest.mock("../../models/product");

describe("GET /smartmandi/product/getProductDetails/:id - UNIT", () => {
  it("should return product details successfully", async () => {
    const mockProduct = { _id: "123", ProductName: "Apple", Category: "Fruit" };
    product.findById.mockResolvedValue(mockProduct);

    const res = await request(app).get("/smartmandi/product/getProductDetails/123");

    expect(res.status).toBe(200);
    expect(res.body.ProductName).toBe("Apple");
    expect(product.findById).toHaveBeenCalledWith("123");
  });

  it("should return 404 if product not found", async () => {
    product.findById.mockResolvedValue(null);

    const res = await request(app).get("/smartmandi/product/getProductDetails/123");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("product details are not found");
  });

  it("should return 500 on database error", async () => {
    product.findById.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/smartmandi/product/getProductDetails/123");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });
});
