// tests/integration/getproductdetails.integration.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../../models/product"); // adjust path

const app = express();
app.use(express.json());

app.get("/smartmandi/product/getProductDetails/:id", async (req, res) => {
  try {
    const product_details = await Product.findById(req.params.id);
    if (!product_details) {
      return res.status(404).json({ message: "product details are not found" });
    }
    res.status(200).json(product_details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

describe("GET /smartmandi/product/getProductDetails/:id - INTEGRATION", () => {
  let mongoServer;

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
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  it("should return product details successfully", async () => {
    const productData = {
      FarmerID: new mongoose.Types.ObjectId(),
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

    const savedProduct = await Product.create(productData);

    const res = await request(app).get(
      `/smartmandi/product/getProductDetails/${savedProduct._id}`
    );

    expect(res.status).toBe(200);
    expect(res.body.ProductName).toBe("Apple");
    expect(res.body.Category).toBe("Fruit");
    expect(res.body.PricePerUnit).toBe(50);
  });

  it("should return 404 if product not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(
      `/smartmandi/product/getProductDetails/${fakeId}`
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("product details are not found");
  });

  it("should return 500 if invalid ObjectId", async () => {
    const res = await request(app).get(
      `/smartmandi/product/getProductDetails/invalid-id`
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
