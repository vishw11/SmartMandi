const request = require("supertest");
const express = require("express");

// Mock Farmer and Vendor models
const Farmer = { save: jest.fn() };
const Vendor = { save: jest.fn() };

// Mock model constructors to return mock instances
jest.mock("../../models/farmer", () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));
});

jest.mock("../../models/vendor", () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));
});

// Re-import after mocks
const FarmerModel = require("../../models/farmer");
const VendorModel = require("../../models/vendor");

// Create express app with route
const app = express();
app.use(express.json());

// Your register route inline for testing
app.post("/smartmandi/register", async (req, res) => {
  try {
    const { role, ...userData } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    let newUser;
    if (role.toLowerCase() === "farmer") {
      newUser = new FarmerModel(userData);
    } else if (role.toLowerCase() === "vendor") {
      newUser = new VendorModel(userData);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();
    res.status(201).json({
      message: `${role} registered successfully`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- TESTS ----------------------

describe("POST /smartmandi/register - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if role is missing", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        fullName: "John Doe",
        email: "john@example.com",
        password: "1234",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Role is required");
  });

  it("should return 400 if role is invalid", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "driver",
        fullName: "John Doe",
        email: "john@example.com",
        password: "1234",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  it("should register farmer successfully", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "farmer",
        fullName: "John Doe",
        email: "john@example.com",
        password: "1234",
        phoneNumber: "9999999999",
        city: "Delhi",
        district: "New Delhi",
        pincode: "110001",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("farmer registered successfully");
    expect(FarmerModel).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "John Doe" })
    );
  });

  it("should register vendor successfully", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "vendor",
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "abcd",
        phoneNumber: "8888888888",
        city: "Mumbai",
        district: "Mumbai",
        pincode: "400001",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("vendor registered successfully");
    expect(VendorModel).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Jane Doe" })
    );
  });
});
