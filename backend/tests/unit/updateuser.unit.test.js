const request = require("supertest");
const express = require("express");

// Mock Farmer and Vendor models
const Farmer = { findByIdAndUpdate: jest.fn() };
const Vendor = { findByIdAndUpdate: jest.fn() };

const app = express();
app.use(express.json());

// Inline version of route
app.put("/smartmandi/update/:role/:id", async (req, res) => {
  try {
    const { id, role } = req.params;
    const updateData = req.body;

    let model;
    if (role.toLowerCase() === "farmer") {
      model = Farmer;
    } else if (role.toLowerCase() === "vendor") {
      model = Vendor;
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await model.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: `${role} details updated successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

describe("PUT /smartmandi/update/:role/:id - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid role", async () => {
    const res = await request(app)
      .put("/smartmandi/update/invalid/123")
      .send({ city: "Pune" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  test("should return 404 if user not found (farmer)", async () => {
    Farmer.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .put("/smartmandi/update/farmer/123")
      .send({ city: "Mumbai" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("should update farmer successfully", async () => {
    Farmer.findByIdAndUpdate.mockResolvedValue({ _id: "123", city: "Delhi" });

    const res = await request(app)
      .put("/smartmandi/update/farmer/123")
      .send({ city: "Delhi" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("farmer details updated successfully");
    expect(Farmer.findByIdAndUpdate).toHaveBeenCalledWith("123", { city: "Delhi" }, { new: true });
  });

  test("should update vendor successfully", async () => {
    Vendor.findByIdAndUpdate.mockResolvedValue({ _id: "456", city: "Jaipur" });

    const res = await request(app)
      .put("/smartmandi/update/vendor/456")
      .send({ city: "Jaipur" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("vendor details updated successfully");
    expect(Vendor.findByIdAndUpdate).toHaveBeenCalledWith("456", { city: "Jaipur" }, { new: true });
  });

  test("should handle server error gracefully", async () => {
    Farmer.findByIdAndUpdate.mockRejectedValue(new Error("DB crashed"));

    const res = await request(app)
      .put("/smartmandi/update/farmer/789")
      .send({ city: "Nashik" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("DB crashed");
  });
});
