const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../index"); // Your Express app
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

describe("PUT /smartmandi/update/:role/:id - INTEGRATION", () => {
  test("should return 400 for invalid role", async () => {
    const res = await request(app)
      .put("/smartmandi/update/invalid/123")
      .send({ city: "Nagpur" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid role");
  });

  test("should return 404 if farmer not found", async () => {
    const res = await request(app)
      .put("/smartmandi/update/farmer/655f1b1b1b1b1b1b1b1b1b1b")
      .send({ city: "Pune" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("should update farmer successfully", async () => {
    const farmer = await Farmer.create({
      fullName: "Ramesh",
      email: "ramesh@example.com",
      password: "12345",
      phoneNumber: "9876543210",
      city: "Mumbai",
      district: "North",
      pincode: "400001",
    });

    const res = await request(app)
      .put(`/smartmandi/update/farmer/${farmer._id}`)
      .send({ city: "Delhi" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("farmer details updated successfully");

    const updatedFarmer = await Farmer.findById(farmer._id);
    expect(updatedFarmer.city).toBe("Delhi");
  });

  test("should update vendor successfully", async () => {
    const vendor = await Vendor.create({
      fullName: "Suresh",
      email: "vendor@example.com",
      password: "12345",
      phoneNumber: "9999999999",
      city: "Hyderabad",
      district: "South",
      pincode: "500001",
    });

    const res = await request(app)
      .put(`/smartmandi/update/vendor/${vendor._id}`)
      .send({ city: "Bangalore" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("vendor details updated successfully");

    const updatedVendor = await Vendor.findById(vendor._id);
    expect(updatedVendor.city).toBe("Bangalore");
  });
});
