const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // your Express app
const Farmer = require("../../models/farmer");

let mongoServer;

// Extend Jest timeout for CI (MongoDB may take time to start)
jest.setTimeout(120000);

beforeAll(async () => {
  process.env.MONGOMS_DISABLE_POSTINSTALL = "1";
  try {
    mongoServer = await MongoMemoryServer.create({
      binary: { version: "7.0.5" },
    });
  } catch (err) {
    console.warn("Fallback to MongoDB 6.0.6:", err.message);
    mongoServer = await MongoMemoryServer.create({
      binary: { version: "6.0.6" },
    });
  }

  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  mongoose.set("debug", true);
});


afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Farmer.deleteMany({});
});

describe("POST /smartmandi/farmer/login - INTEGRATION", () => {
  test("should return 400 if farmer not found", async () => {
    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "notfound@example.com", password: "password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/notfound@example.com not found/i);
  });

  test("should return 400 if password is incorrect", async () => {
    await Farmer.create({
      fullName: "Suresh",
      email: "farmer@example.com",
      password: "correctpass",
      phoneNumber: "9999999999",
      pincode: "400001",
      city: "Mumbai",
      district: "West",
    });

    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "farmer@example.com", password: "wrongpass" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/wrong/i);
  });

  test("should return 200 if login successful", async () => {
    const farmer = await Farmer.create({
      fullName: "Ramesh",
      email: "ramesh@example.com",
      password: "farmer4563",
      phoneNumber: "9876543210",
      pincode: "400001",
      city: "Mumbai",
      district: "West",
    });

    const res = await request(app)
      .post("/smartmandi/farmer/login")
      .send({ email: "ramesh@example.com", password: "farmer4563" });

    expect(res.statusCode).toBe(200);
    expect(res.body.farmerId._id.toString()).toBe(farmer._id.toString());
  });
});
