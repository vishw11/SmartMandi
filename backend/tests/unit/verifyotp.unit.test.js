const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.json());

const otpStore = {}; // local OTP store for unit test

app.post("/smartmandi/user/verifyOtp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

describe("POST /smartmandi/user/verifyOtp - UNIT", () => {
  beforeEach(() => {
    for (const key in otpStore) delete otpStore[key];
  });

  it("should verify OTP successfully", async () => {
    otpStore["john@example.com"] = "123456";

    const res = await request(app)
      .post("/smartmandi/user/verifyOtp")
      .send({ email: "john@example.com", otp: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP verified successfully");
    expect(otpStore["john@example.com"]).toBeUndefined();
  });

  it("should return 400 for invalid OTP", async () => {
    otpStore["john@example.com"] = "123456";

    const res = await request(app)
      .post("/smartmandi/user/verifyOtp")
      .send({ email: "john@example.com", otp: "999999" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid OTP");
    expect(otpStore["john@example.com"]).toBe("123456");
  });

  it("should return 400 if email or OTP missing", async () => {
    const res = await request(app).post("/smartmandi/user/verifyOtp").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and OTP required");
  });
});
