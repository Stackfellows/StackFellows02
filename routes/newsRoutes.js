const express = require("express");
const router = express.Router();
const Newsletter = require("../models/newsModel");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// --- Brevo API Setup ---
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// --- 1. SUBSCRIBE ROUTE ---
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    const sendEmail = {
      sender: { email: "stackfellows684@gmail.com", name: "Stack Fellows" },
      to: [{ email: email }],
      subject: "Welcome to Stack Fellows Newsletter!",
      htmlContent: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Stack Fellows" style="width: 100%; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1; text-align: center;">Welcome to the Club!</h2>
          <p>Thank you for subscribing to <strong>Stack Fellows</strong>. We're excited to have you with us!</p>
          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 30px;">© 2025 Stack Fellows. All rights reserved.</p>
        </div>
      `,
    };

    apiInstance
      .sendTransacEmail(sendEmail)
      .catch((e) => console.log("Brevo Error:", e));

    res
      .status(201)
      .json({ success: true, message: "Success! Check your inbox." });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Already subscribed." });
    res.status(500).json({ success: false, message: "Server Error." });
  }
});

// --- 2. BROADCAST ROUTE ---
router.post("/broadcast", async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    const subscribers = await Newsletter.find({}, "email");
    const emailList = subscribers.map((s) => ({ email: s.email }));

    if (emailList.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No subscribers found." });

    const sendEmail = {
      sender: { email: "stackfellows684@gmail.com", name: "Stack Fellows" },
      to: emailList,
      subject: subject,
      htmlContent: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <img src="https://res.cloudinary.com/dpskpjjmy/image/upload/v1756652273/Stackfellows_jfukyj.jpg" alt="Update" style="width: 100%; border-radius: 8px;">
          </div>
          <h2 style="color: #6B46C1; text-align: center;">New Update!</h2>
          <p style="font-size: 16px; color: #333;">${message}</p>
          <div style="text-align: center; margin-top: 25px;">
             <a href="https://stackfellows.com" style="background: #6B46C1; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Visit Our Website</a>
          </div>
          <p style="text-align: center; font-size: 11px; color: #999; margin-top: 40px;">
            Johar Town, Lahore, Pakistan <br>
            © 2025 Stack Fellows. All rights reserved.
          </p>
        </div>
      `,
    };

    await apiInstance.sendTransacEmail(sendEmail);

    res.status(200).json({
      success: true,
      message: `Broadcast delivered successfully to ${emailList.length} subscribers!`,
    });
  } catch (error) {
    console.error("DETAILED BREVO ERROR:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send via Brevo API." });
  }
});

module.exports = router;
