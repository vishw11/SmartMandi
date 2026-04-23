const request = require("supertest");
const express = require("express");

// Mock Vendor model
const Vendor = { findOne: jest.fn() };

const app = express();
app.use(express.json());

// Inline version of the login route
app.post("/smartmandi/vendor/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(400).json({ message: `${email} not found` });
    }

    if (password != vendor.password) {
      return res.status(400).json({ message: "password is wrong" });
    }

    res.status(200).json({ vendorId: vendor._id });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

describe("POST /smartmandi/vendor/login - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if vendor not found", async () => {
    Vendor.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "test@vendor.com", password: "12345" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("test@vendor.com not found");
  });

  test("should return 400 if password is wrong", async () => {
    Vendor.findOne.mockResolvedValue({
      email: "test@vendor.com",
      password: "correct",
    });

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "test@vendor.com", password: "wrong" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("password is wrong");
  });

  test("should return 200 if login successful", async () => {
    const fakeVendor = { _id: "abc123", email: "test@vendor.com", password: "12345" };
    Vendor.findOne.mockResolvedValue(fakeVendor);

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "test@vendor.com", password: "12345" });

    expect(res.statusCode).toBe(200);
    expect(res.body.vendorId).toBe("abc123");
  });

  test("should handle server error gracefully", async () => {
    Vendor.findOne.mockRejectedValue(new Error("DB crashed"));

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "test@vendor.com", password: "12345" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Error fetching user details");
  });
});
