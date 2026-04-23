const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // Your Express app
const Farmer = require("../../models/farmer");
const Vendor = require("../../models/vendor");

let mongoServer;

// Increase Jest timeout for slower environments
jest.setTimeout(60000);

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
  await Vendor.deleteMany({});
});

describe("POST /smartmandi/register - INTEGRATION", () => {
  test("should return 400 if role is missing", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        fullName: "No Role User",
        email: "norole@example.com",
        password: "12345",
        phoneNumber: "9876543210",
        city: "Delhi",
        district: "Central",
        pincode: "110001",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/role is required/i);
  });

  test("should return 400 if role is invalid", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "driver",
        fullName: "Invalid Role",
        email: "invalid@example.com",
        password: "pass123",
        phoneNumber: "9876543211",
        city: "Delhi",
        district: "Central",
        pincode: "110001",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid role/i);
  });

  test("should register farmer successfully", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "farmer",
        fullName: "Farmer Raju",
        email: "raju@example.com",
        password: "farmer123",
        phoneNumber: "9999999999",
        city: "Pune",
        district: "Rural",
        pincode: "411001",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/farmer registered successfully/i);

    const farmerInDb = await Farmer.findOne({ email: "raju@example.com" });
    expect(farmerInDb).not.toBeNull();
    expect(farmerInDb.fullName).toBe("Farmer Raju");
  });

  test("should register vendor successfully", async () => {
    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "vendor",
        fullName: "Vendor Meena",
        email: "meena@example.com",
        password: "vendor123",
        phoneNumber: "8888888888",
        city: "Mumbai",
        district: "South",
        pincode: "400001",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/vendor registered successfully/i);

    const vendorInDb = await Vendor.findOne({ email: "meena@example.com" });
    expect(vendorInDb).not.toBeNull();
    expect(vendorInDb.fullName).toBe("Vendor Meena");
  });

  test("should not register same email twice", async () => {
    await request(app)
      .post("/smartmandi/register")
      .send({
        role: "farmer",
        fullName: "Farmer Duplicate",
        email: "dup@example.com",
        password: "12345",
        phoneNumber: "9876543212",
        city: "Delhi",
        district: "North",
        pincode: "110001",
      });

    const res = await request(app)
      .post("/smartmandi/register")
      .send({
        role: "farmer",
        fullName: "Farmer Duplicate",
        email: "dup@example.com",
        password: "12345",
        phoneNumber: "9876543212",
        city: "Delhi",
        district: "North",
        pincode: "110001",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/duplicate key/i);
  });
});
