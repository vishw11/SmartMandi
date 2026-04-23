// tests/unit/addproduct.unit.test.js
const request = require("supertest");
const express = require("express");
const product = require("../../models/product"); // adjust path
const app = express();

app.use(express.json());
app.post("/smartmandi/product/addNewProduct", async (req, res) => {
  try {
    let newProduct = new product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

jest.mock("../../models/product");

describe("POST /smartmandi/product/addNewProduct - UNIT", () => {
  it("should add product successfully", async () => {
    const productData = {
      FarmerID: "123456789012",
      ProductName: "Apple",
      Category: "Fruit",
      Description: "Fresh apples",
      PricePerUnit: 50,
      UnitType: "kg",
      QuantityAvailable: 100,
      MinimumOrderQuantity: 1,
      ListingDate: "2025-11-05",
      Status: "Active",
      rating: 4,
      images: ["img1.jpg"]
    };

    const saveMock = jest.fn().mockResolvedValue(productData);
    product.mockImplementation(() => ({ save: saveMock }));

    const res = await request(app)
      .post("/smartmandi/product/addNewProduct")
      .send(productData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("product added successfully");
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it("should handle errors during product creation", async () => {
    const productData = { ProductName: "Apple" };
    const saveMock = jest.fn().mockRejectedValue(new Error("DB failed"));
    product.mockImplementation(() => ({ save: saveMock }));

    const res = await request(app)
      .post("/smartmandi/product/addNewProduct")
      .send(productData);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB failed");
  });
});
