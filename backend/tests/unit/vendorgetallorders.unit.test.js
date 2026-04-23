// tests/unit/getVendorOrders.unit.test.js

const request = require("supertest");
const app = require("../../index");
const Order = require("../../models/order");

jest.mock("../../models/order");

describe("GET /smartmandi/vendor/getAllOrders/:vendorId - UNIT", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return orders for a vendor", async () => {
    const fakeOrders = [
      { vendorId: "v1", productId: { rating: 4.5 } },
    ];

    const populateMock = { populate: jest.fn().mockResolvedValue(fakeOrders) };
    Order.find.mockReturnValue(populateMock);

    const res = await request(app).get("/smartmandi/vendor/getAllOrders/v1");

    expect(Order.find).toHaveBeenCalledWith({ vendorId: "v1" });
    expect(populateMock.populate).toHaveBeenCalledWith("productId", "rating");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeOrders);
  });

  it("should return 'No orders found' if none exist", async () => {
    const populateMock = { populate: jest.fn().mockResolvedValue([]) };
    Order.find.mockReturnValue(populateMock);

    const res = await request(app).get("/smartmandi/vendor/getAllOrders/v1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No orders found");
  });

  it("should return 500 if there is a server error", async () => {
    const populateMock = { populate: jest.fn().mockRejectedValue(new Error("DB error")) };
    Order.find.mockReturnValue(populateMock);

    const res = await request(app).get("/smartmandi/vendor/getAllOrders/v1");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Error fetching order details");
  });
});
