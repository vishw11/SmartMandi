// tests/integration/addproduct.integration.test.js
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Product = require("../../models/product"); // adjust path

const app = express();
app.use(express.json());
app.post("/smartmandi/product/addNewProduct", async (req, res) => {
  try {
    let newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "product added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

describe("POST /smartmandi/product/addNewProduct - INTEGRATION", () => {
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

  it("should add product successfully", async () => {
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

    const res = await request(app)
      .post("/smartmandi/product/addNewProduct")
      .send(productData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("product added successfully");

    const savedProduct = await Product.findOne({ ProductName: "Apple" });
    expect(savedProduct).not.toBeNull();
    expect(savedProduct.Category).toBe("Fruit");
  });

  it("should return 500 if product save fails", async () => {
    // Sending invalid data (missing required fields) triggers Mongoose validation error
    const res = await request(app)
      .post("/smartmandi/product/addNewProduct")
      .send({ ProductName: "Incomplete Product" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
