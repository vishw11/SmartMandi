// tests/integration/sendotp.integration.test.js

const request = require("supertest");
const app = require("../../index"); // your Express app

// Mock the mailer util
jest.mock("../../utils/mailer"); 
const sendEmail = require("../../utils/mailer");

describe("POST /smartmandi/user/sendOtp - INTEGRATION", () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // clear previous mocks
  });

  it("should send OTP successfully", async () => {
    // Mock sendEmail to simulate success
    sendEmail.mockResolvedValue(true);

    const res = await request(app)
      .post("/smartmandi/user/sendOtp")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP sent successfully");
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      "john@example.com",
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
  });

  it("should return 500 if sendEmail fails", async () => {
    // Mock sendEmail to throw error
    sendEmail.mockImplementation(async () => {
      throw new Error("SMTP error");
    });

    const res = await request(app)
      .post("/smartmandi/user/sendOtp")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to send OTP");
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("should return 400 if email is not provided", async () => {
    const res = await request(app)
      .post("/smartmandi/user/sendOtp")
      .send({}); // no email

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email required");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
