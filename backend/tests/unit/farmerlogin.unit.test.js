const request = require("supertest");
const express = require("express");

// Mock Farmer model
const Farmer = { findOne: jest.fn() };

// Import your route (simulate app)
const app = express();
app.use(express.json());
app.post("/smartmandi/farmer/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const farmer = await Farmer.findOne({ email });

    if (!farmer) {
      return res.status(400).json({ message: `${email} not found` });
    }

    if (password != farmer.password) {
      return res.status(400).json({ message: `Entered password is wrong` });
    }

    res.status(200).json({ farmerId: farmer });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user details" });
  }
});

describe("POST /smartmandi/farmer/login - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if farmer not found", async () => {
    Farmer.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "test@example.com", password: "12345" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("test@example.com not found");
  });

  it("should return 400 if password is wrong", async () => {
    Farmer.findOne.mockResolvedValue({ email: "test@example.com", password: "abcd" });

    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "test@example.com", password: "wrong" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Entered password is wrong");
  });

  it("should return 200 if login is successful", async () => {
    const fakeFarmer = { _id: "123", email: "test@example.com", password: "12345" };
    Farmer.findOne.mockResolvedValue(fakeFarmer);

    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "test@example.com", password: "12345" });

    expect(res.status).toBe(200);
    expect(res.body.farmerId).toEqual(fakeFarmer);
  });
});
