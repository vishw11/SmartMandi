const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index");
const Farmer = require("../../models/farmer");
const Vendor = require("../../models/vendor");

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({ binary: { version: "7.0.5" } });
  } catch (err) {
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
  await Farmer.deleteMany({});
  await Vendor.deleteMany({});
});

describe("GET /smartmandi/user/:role/:id - INTEGRATION", () => {
  test("should return 400 for invalid role", async () => {
    const res = await request(app).get("/smartmandi/user/invalid/123");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  test("should return 404 if farmer not found", async () => {
    const res = await request(app).get("/smartmandi/user/farmer/655f1b1b1b1b1b1b1b1b1b1b");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("farmer not found");
  });

  test("should return farmer details successfully", async () => {
    const farmer = await Farmer.create({
      fullName: "Ramesh",
      email: "ramesh@example.com",
      password: "12345",
      phoneNumber: "9876543210",
      city: "Mumbai",
      district: "North",
      pincode: "400001",
    });

    const res = await request(app).get(`/smartmandi/user/farmer/${farmer._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Ramesh");
    expect(res.body.city).toBe("Mumbai");
  });

  test("should return vendor details successfully", async () => {
    const vendor = await Vendor.create({
      fullName: "Suresh",
      email: "suresh@example.com",
      password: "abc123",
      phoneNumber: "9999999999",
      city: "Delhi",
      district: "South",
      pincode: "500001",
    });

    const res = await request(app).get(`/smartmandi/user/vendor/${vendor._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Suresh");
    expect(res.body.city).toBe("Delhi");
  });
});
