const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());

// In-memory store for OTPs in this integration test
const otpMap = {};

// Route under test
app.post("/smartmandi/user/verifyOtp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  if (otpMap[email] === otp) {
    delete otpMap[email];
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

describe("POST /smartmandi/user/verifyOtp - INTEGRATION", () => {
  beforeEach(() => {
    for (const key in otpMap) delete otpMap[key]; // reset store
  });

  it("should verify OTP successfully", async () => {
    otpMap["john@example.com"] = "123456";

    const res = await request(app)
      .post("/smartmandi/user/verifyOtp")
      .send({ email: "john@example.com", otp: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP verified successfully");
    expect(otpMap["john@example.com"]).toBeUndefined();
  });

  it("should return 400 for invalid OTP", async () => {
    otpMap["john@example.com"] = "123456";

    const res = await request(app)
      .post("/smartmandi/user/verifyOtp")
      .send({ email: "john@example.com", otp: "999999" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid OTP");
    expect(otpMap["john@example.com"]).toBe("123456"); // should remain
  });

  it("should return 400 if email or OTP missing", async () => {
    const res = await request(app).post("/smartmandi/user/verifyOtp").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and OTP required");
  });
});
