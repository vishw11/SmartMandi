const request = require("supertest");
const express = require("express");

// Mock OTP utilities
jest.mock("../../utils/mailer", () => ({
  generateOTP: jest.fn(),
  sendEmail: jest.fn(),
}));

const { generateOTP, sendEmail } = require("../../utils/mailer");

// Create a mock app
const app = express();
app.use(express.json());

const otpStore = {}; // local for unit test

app.post("/smartmandi/user/sendOtp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = generateOTP();
  otpStore[email] = otp;

  try {
    await sendEmail(email, "One time password", `Your OTP is ${otp}`, `<p>Your OTP is <b>${otp}</b></p>`);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

describe("POST /smartmandi/user/sendOtp - UNIT", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send OTP successfully", async () => {
    generateOTP.mockReturnValue("123456");
    sendEmail.mockResolvedValue(true);

    const res = await request(app)
      .post("/smartmandi/user/sendOtp")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP sent successfully");
    expect(generateOTP).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(otpStore["john@example.com"]).toBe("123456");
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(app).post("/smartmandi/user/sendOtp").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email required");
  });

  it("should handle sendEmail failure", async () => {
    generateOTP.mockReturnValue("123456");
    sendEmail.mockRejectedValue(new Error("SMTP error"));

    const res = await request(app)
      .post("/smartmandi/user/sendOtp")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to send OTP");
  });
});
