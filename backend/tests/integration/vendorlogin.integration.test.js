const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index");
const Vendor = require("../../models/vendor");

let mongoServer;

jest.setTimeout(60000);

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
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await Vendor.deleteMany({});
});

describe("POST /smartmandi/vendor/login - INTEGRATION", () => {
  test("should return 400 if vendor not found", async () => {
    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "notfound@vendor.com", password: "12345" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("notfound@vendor.com not found");
  });

  test("should return 400 if password is wrong", async () => {
    await Vendor.create({
      fullName: "Ramesh",
      email: "vendor@vendor.com",
      password: "correct",
      phoneNumber: "9999999999",
      city: "Mumbai",
      district: "North",
      pincode: "400001",
    });

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "vendor@vendor.com", password: "wrong" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("password is wrong");
  });

  test("should return 200 if login successful", async () => {
    const vendor = await Vendor.create({
      fullName: "Suresh",
      email: "suresh@vendor.com",
      password: "12345",
      phoneNumber: "8888888888",
      city: "Delhi",
      district: "Central",
      pincode: "110001",
    });

    const res = await request(app)
      .post("/smartmandi/vendor/login")
      .send({ email: "suresh@vendor.com", password: "12345" });

    expect(res.statusCode).toBe(200);
    expect(res.body.vendorId).toBe(vendor._id.toString());
  });
});
