const request = require("supertest");
const express = require("express");

// Mock Farmer and Vendor models
const Farmer = { findById: jest.fn() };
const Vendor = { findById: jest.fn() };

const app = express();

// Inline route definition for unit testing
app.get("/smartmandi/user/:role/:id", async (req, res) => {
  try {
    const { role, id } = req.params;
    let model;
    if (role.toLowerCase() === "farmer") {
      model = Farmer;
    } else if (role.toLowerCase() === "vendor") {
      model = Vendor;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await model.findById(id);
    if (!user) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

describe("GET /smartmandi/user/:role/:id - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid role", async () => {
    const res = await request(app).get("/smartmandi/user/invalid/123");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  test("should return 404 if farmer not found", async () => {
    Farmer.findById.mockResolvedValue(null);

    const res = await request(app).get("/smartmandi/user/farmer/123");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("farmer not found");
  });

  test("should return farmer details successfully", async () => {
    const fakeFarmer = { _id: "123", fullName: "Ramesh", city: "Mumbai" };
    Farmer.findById.mockResolvedValue(fakeFarmer);

    const res = await request(app).get("/smartmandi/user/farmer/123");
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Ramesh");
    expect(Farmer.findById).toHaveBeenCalledWith("123");
  });

  test("should return vendor details successfully", async () => {
    const fakeVendor = { _id: "456", fullName: "Suresh", city: "Delhi" };
    Vendor.findById.mockResolvedValue(fakeVendor);

    const res = await request(app).get("/smartmandi/user/vendor/456");
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Suresh");
    expect(Vendor.findById).toHaveBeenCalledWith("456");
  });

  test("should handle server error", async () => {
    Farmer.findById.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/smartmandi/user/farmer/123");
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Error fetching user details");
  });
});
